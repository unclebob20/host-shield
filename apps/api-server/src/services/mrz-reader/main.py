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
        
        # 1. Try Original
        mrz = read_mrz(image_path, save_roi=True)
        
        # 2. If fail, try rotations
        rotated_path = image_path + "_rot.jpg"
        
        if not mrz:
            print("Original failed, trying rotations...")
            try:
                with PILImage.open(image_path) as img:
                    for angle in [90, 180, 270]:
                        print(f"Trying rotation {angle}...")
                        rotated = img.rotate(angle, expand=True)
                        rotated.save(rotated_path)
                        
                        mrz = read_mrz(rotated_path, save_roi=True)
                        if mrz:
                            print(f"Success at {angle} degrees!")
                            break
            except Exception as e:
                print(f"Rotation error: {e}")

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
    elif doc_type in ['I', 'ID', 'AC', 'C']:
        return "ID_CARD"
    else:
        return "UNKNOWN"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
