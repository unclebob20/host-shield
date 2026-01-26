from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from passporteye import read_mrz
from pdf2image import convert_from_path
import tempfile
import os
from typing import Optional
from PIL import Image

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
        
        # Use PassportEye to read MRZ
        mrz_data = read_mrz(image_path)
        
        if mrz_data is None or not mrz_data.mrz_type:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "error": "No MRZ found in image. Please ensure the document is clearly visible and well-lit."
                }
            )
        
        # Extract fields
        mrz_dict = mrz_data.to_dict()
        
        # Map to our format
        result = {
            "success": True,
            "data": {
                "first_name": clean_name(mrz_dict.get("names")),
                "last_name": clean_name(mrz_dict.get("surname")),
                "nationality_iso3": mrz_dict.get("nationality"),
                "document_number": clean_document_number(mrz_dict.get("number")),
                "date_of_birth": format_date(mrz_dict.get("date_of_birth")),
                "document_type": map_document_type(mrz_dict.get("type")),
                "sex": mrz_dict.get("sex"),
                "expiry_date": format_date(mrz_dict.get("expiration_date")),
                "valid_score": mrz_dict.get("valid_score", 0),
                "mrz_type": mrz_data.mrz_type
            }
        }
        
        return JSONResponse(content=result)
        
    except Exception as e:
        return JSONResponse(
            status_code=200,
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
    # Remove trailing K/L (with or without spaces)
    # "IVANK" -> "IVAN", "IVAN K K K" -> "IVAN"
    cleaned = re.sub(r'[KL\s]+$', '', cleaned)
    # Remove isolated K/L between spaces
    cleaned = re.sub(r'\s+[KL]\s+', ' ', cleaned)
    
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
    
    yy = int(date_str[0:2])
    mm = date_str[2:4]
    dd = date_str[4:6]
    
    # Y2K logic: 00-49 = 20xx, 50-99 = 19xx
    yyyy = f"20{yy:02d}" if yy < 50 else f"19{yy:02d}"
    
    return f"{yyyy}-{mm}-{dd}"

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
