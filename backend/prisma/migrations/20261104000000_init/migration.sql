-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PROCESSING', 'COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "RuleStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "PackageShape" AS ENUM ('RECTANGULAR', 'CYLINDRICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PanelType" AS ENUM ('PDP', 'BACK', 'SIDE_LEFT', 'SIDE_RIGHT', 'TOP', 'BOTTOM');

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "brand_name" TEXT,
    "package_shape" "PackageShape" NOT NULL DEFAULT 'RECTANGULAR',
    "dimensions" JSONB NOT NULL,
    "pdp_area_sq_cm" DOUBLE PRECISION NOT NULL,
    "overall_status" "InspectionStatus" NOT NULL DEFAULT 'PROCESSING',
    "overall_confidence" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_images" (
    "id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_hash_sha256" TEXT NOT NULL,
    "panel_type" "PanelType" NOT NULL DEFAULT 'PDP',
    "mime_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "image_width_px" INTEGER NOT NULL,
    "image_height_px" INTEGER NOT NULL,
    "blur_score" DOUBLE PRECISION,
    "raw_ocr_result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_declarations" (
    "id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "raw_text" TEXT NOT NULL,
    "normalized_value" JSONB NOT NULL,
    "bounding_box" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "is_user_overridden" BOOLEAN NOT NULL DEFAULT false,
    "override_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracted_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_versions" (
    "id" TEXT NOT NULL,
    "rule_code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "legal_citation" TEXT NOT NULL,
    "gazette_ref" TEXT,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "is_provisional" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_evaluations" (
    "id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "rule_version_id" TEXT NOT NULL,
    "status" "RuleStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "explanation" TEXT NOT NULL,
    "evidence_snippet" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extracted_declarations_inspection_id_field_name_key" ON "extracted_declarations"("inspection_id", "field_name");

-- CreateIndex
CREATE UNIQUE INDEX "rule_versions_rule_code_key" ON "rule_versions"("rule_code");

-- CreateIndex
CREATE UNIQUE INDEX "rule_evaluations_inspection_id_rule_version_id_key" ON "rule_evaluations"("inspection_id", "rule_version_id");

-- AddForeignKey
ALTER TABLE "uploaded_images" ADD CONSTRAINT "uploaded_images_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_declarations" ADD CONSTRAINT "extracted_declarations_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_evaluations" ADD CONSTRAINT "rule_evaluations_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_evaluations" ADD CONSTRAINT "rule_evaluations_rule_version_id_fkey" FOREIGN KEY ("rule_version_id") REFERENCES "rule_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

