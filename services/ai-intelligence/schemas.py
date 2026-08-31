from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ExtractedFieldModel(BaseModel):
    fieldName: str
    fieldValue: str
    confidence: float = Field(ge=0.0, le=1.0)
    sourcePage: Optional[int] = 1
    rawSnippet: Optional[str] = None
    isPresent: bool = True

class ExtractionRequest(BaseModel):
    documentId: str
    requirementCode: str
    bidId: str
    text: Optional[str] = None
    imageBase64: Optional[str] = None
    mimeType: Optional[str] = "application/pdf"

class ExtractionResponse(BaseModel):
    documentId: str
    requirementCode: str
    overallConfidence: float
    detectedPage: int
    rawTextSummary: str
    extractedFields: Dict[str, Any]
    items: List[ExtractedFieldModel]

class AdvisoryRequest(BaseModel):
    bidId: str
    tenderTitle: str
    bidderLegalName: str
    deterministicScore: int
    riskLevel: str
    complianceChecks: List[Dict[str, Any]]
    verifications: List[Dict[str, Any]]
    extractedFields: Dict[str, Any]

class AdvisoryResponse(BaseModel):
    recommendation: str # QUALIFIED | DISQUALIFIED | REQUIRES_CLARIFICATION
    confidence: float
    reason: str
    keyPositiveFactors: List[str]
    criticalDefects: List[str]
    clarificationsToSeek: List[str]
    statutoryCitations: List[str]
    generatedAt: str
