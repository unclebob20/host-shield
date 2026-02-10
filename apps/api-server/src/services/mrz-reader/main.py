from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from passporteye import read_mrz
from pdf2image import convert_from_path
import tempfile
import os
from typing import Optional
import PIL.Image as PILImage

app = FastAPI(title="MRZ Reader Service", version="1.0.0")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "mrz-reader"}

@app.post("/extract-mrz")
async def extract_mrz(file: UploadFile = File(...)):
    """
    Extract MRZ data from passport or ID card image/PDF.
    
    Returns structured data including:
    - first_name
    - last_name
    - nationality
    - document_number
    - date_of_birth
    - document_type
    """
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    image_path = tmp_path
    converted_image_path = None
    
    try:
        # If PDF, convert to image first
        if tmp_path.lower().endswith('.pdf'):
            images = convert_from_path(tmp_path, dpi=300, first_page=1, last_page=1)
            if images:
                # Save first page as temporary image
                converted_image_path = tmp_path.replace('.pdf', '.jpg')
                images[0].save(converted_image_path, 'JPEG')
                image_path = converted_image_path
            else:
                return JSONResponse(
                    status_code=200,
                    content={
                        "success": False,
                        "error": "Failed to convert PDF to image"
                    }
                )
        
        # Pre-process: Convert RGBA (transparent PNGs) to RGB
        # This fixes specific issues with "cannot write mode RGBA as JPEG" during rotation
        # and improves compatibility with PassportEye
        try:
            with PILImage.open(image_path) as img:
                if img.mode == 'RGBA':
                    print("Converting RGBA image to RGB...")
                    rgb_path = os.path.splitext(image_path)[0] + "_rgb.jpg"
                    img.convert('RGB').save(rgb_path, "JPEG")
                    
                    # If we already converted from PDF, clean up that intermediate file
                    if converted_image_path and image_path == converted_image_path:
                         try:
                             os.unlink(image_path)
                         except: pass
                    
                    image_path = rgb_path
                    converted_image_path = rgb_path # Ensure it gets cleaned up
        except Exception as e:
            print(f"Image preprocessing warning: {e}")
        except Exception as e:
            print(f"Image preprocessing warning: {e}")
        
        # Try combinations of Rotations + Crops
        # This handles cases where image is sideways AND needs cropping
        
        candidates = []
        
        # Helper to generate candidates for an image object
        def add_candidates_from_image(img_obj, label=""):
            # 1. Full Image (in case crop cuts off text)
            full_path = tempfile.mktemp(suffix=f"_{label}_full.jpg")
            img_obj.save(full_path)
            candidates.append({"img": full_path, "crop": False})
            
            # 2. Bottom Crop
            w, h = img_obj.size
            crop_path = tempfile.mktemp(suffix=f"_{label}_crop.jpg")
            crop_box = (0, int(h * 0.65), w, h)
            img_obj.crop(crop_box).save(crop_path)
            candidates.append({"img": crop_path, "crop": False}) # Already cropped, so flag is False for processing loop

        try:
            with PILImage.open(image_path) as img:
                # A. Original
                add_candidates_from_image(img, "orig")
                
                # B. Micro-Rotations for small skews (Fixes "cut off text" on slightly angled photos)
                for small_angle in [-3, 3, -5, 5]:
                    rotated = img.rotate(small_angle, expand=True) # expand changes size slightly but safer
                    add_candidates_from_image(rotated, f"skew{small_angle}")

                # C. Major Rotations
                for angle in [90, 180, 270]:
                    rotated = img.rotate(angle, expand=True)
                    add_candidates_from_image(rotated, f"rot{angle}")

        except Exception as e:
            print(f"Candidate generation failed: {e}")

        # Helper to clean image (Thresholding) to remove holograms
        def clean_image_for_ocr(input_path):
            try:
                import cv2
                # Load
                img_cv = cv2.imread(input_path)
                if img_cv is None: return input_path
                
                # Gray
                gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                # Blur
                blurred = cv2.GaussianBlur(gray, (3, 3), 0)
                # Adaptive Threshold (removes shadows/holograms)
                thresh = cv2.adaptiveThreshold(
                    blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 10
                )
                
                out_path = input_path.replace(".jpg", "_clean.jpg")
                cv2.imwrite(out_path, thresh)
                return out_path
            except Exception as e:
                print(f"Cleaning failed: {e}")
                return input_path

        best_mrz = None
        best_score = -1


        
        # Execute Search
        for cand in candidates:
            # Step 1: Get the geometry candidate (Crop/Rotate)
            target_path = cand["img"]
            
            # --- PASS 1: Try RAW image (Best for clean, aligned scans) ---
            print(f"Scanning RAW: {target_path}...")
            mrz = read_mrz(target_path, save_roi=True)
            
            if mrz:
                score = mrz.to_dict().get('valid_score', 0)
                print(f"RAW score: {score}")
                if score > best_score:
                    best_score = score
                    best_mrz = mrz
                
                if score >= 90: # High confidence? Stop looking.
                    print("Found High Confidence Score (RAW). Stopping.")
                    break
            
            # --- PASS 2: Try CLEANED image (Best for noisy holograms/ID cards) ---
            print(f"Cleaning: {target_path}...")
            clean_path = clean_image_for_ocr(target_path)
            
            print(f"Scanning CLEANED: {clean_path}...")
            mrz = read_mrz(clean_path, save_roi=True)
            
            if mrz:
                score = mrz.to_dict().get('valid_score', 0)
                print(f"CLEANED score: {score}")
                if score > best_score:
                    best_score = score
                    best_mrz = mrz

                if score >= 90: # High confidence? Stop looking.
                    print("Found High Confidence Score (CLEANED). Stopping.")
                    break

        mrz = best_mrz
        if not mrz:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "error": "No MRZ found in image. Please ensure the document is clearly visible and well-lit."
                }
            )

        mrz_data = mrz.to_dict()
        
        # Parse Dates safely
        birth_date = format_date(mrz_data.get("date_of_birth", ""))
        expiration_date = format_date(mrz_data.get("expiration_date", ""))

        result = {
            "success": True,
            "data": {
                "document_type": map_document_type(mrz_data.get("type", "P")),
                "country_code": mrz_data.get("country", ""),
                "last_name": clean_name(mrz_data.get("surname", "")),
                "first_name": clean_name(mrz_data.get("names", "")),
                "document_number": clean_document_number(mrz_data.get("number", "")),
                "nationality_iso3": mrz_data.get("nationality", ""),
                "date_of_birth": birth_date,
                "document_expiry_date": expiration_date, # Renamed from expiration_date to document_expiry_date
                "sex": mrz_data.get("sex", "U"),
                "valid_score": mrz_data.get("valid_score", 0), # Added back from original
                "mrz_type": mrz.mrz_type, # Added back from original
                "raw_mrz": str(mrz) # Added from new code
            }
        }
        
        return JSONResponse(content=result)

    except Exception as e:
        print(f"Error processing: {e}")
        return JSONResponse(
            status_code=200, # Changed to 200 as per original code's error status
            content={
                "success": False,
                "error": f"MRZ extraction failed: {str(e)}"
            }
        )
    finally:
        # Clean up temp files
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        if converted_image_path and os.path.exists(converted_image_path):
            os.unlink(converted_image_path)

def clean_name(name: Optional[str]) -> Optional[str]:
    """Remove MRZ filler characters from names"""
    if not name:
        return None
    
    # Remove < characters and convert to spaces
    cleaned = name.replace('<', ' ').strip()
    
    # Remove sequences of K and L (OCR misreads of <)
    import re
    # Remove trailing K/L/E/C/S/M logic (OCR misreads of <)
    # ONLY if preceded by space to protect names ending in K/L (e.g. MARK)
    # "BORIS S KKK" -> "BORIS", "MARK" -> "MARK"
    cleaned = re.sub(r'\s+[KLECSM\s]+$', '', cleaned)
    
    # Remove isolated chars between spaces (likely filler noise)
    # "IVAN K THE" -> "IVAN THE"
    cleaned = re.sub(r'\s+[KLECSM]\s+', ' ', cleaned)
    
    # Normalize multiple spaces to single space
    cleaned = ' '.join(cleaned.split())
    return cleaned if cleaned else None

def clean_document_number(doc_num: Optional[str]) -> Optional[str]:
    """Remove MRZ filler characters from document number"""
    if not doc_num:
        return None
    # Remove < characters and spaces
    return doc_num.replace('<', '').replace(' ', '').strip()

def format_date(date_str: Optional[str]) -> Optional[str]:
    """Convert YYMMDD to YYYY-MM-DD"""
    if not date_str or len(date_str) != 6:
        return None
    
    try:
        yy = int(date_str[0:2])
        mm = date_str[2:4]
        dd = date_str[4:6]
        
        # Validate Month/Day are numeric too
        if not (mm.isdigit() and dd.isdigit()):
             return None

        # Y2K logic: 00-49 = 20xx, 50-99 = 19xx
        yyyy = f"20{yy:02d}" if yy < 50 else f"19{yy:02d}"
        
        return f"{yyyy}-{mm}-{dd}"
    except ValueError:
        # OCR read garbage characters instead of numbers
        return None

def map_document_type(doc_type: Optional[str]) -> str:
    """Map MRZ document type to our enum"""
    if not doc_type:
        return "UNKNOWN"
    
    doc_type = doc_type.upper()
    if doc_type.startswith('P'):
        return "PASSPORT"
    elif doc_type.startswith('I') or doc_type.startswith('A') or doc_type.startswith('C') or doc_type in ['ID', 'AC', 'IR', 'RP']:
        return "ID_CARD"
    else:
        return "UNKNOWN"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
