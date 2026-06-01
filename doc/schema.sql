-- ============================================================
-- PLATAFORMA DE HISTORIAS CLÍNICAS ODONTOLÓGICAS
-- DDL completo para Supabase / PostgreSQL
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('doctor', 'admin');
CREATE TYPE currency_type AS ENUM ('USD', 'VES', 'EUR');
CREATE TYPE eruption_status AS ENUM ('erupted', 'semi', 'not_erupted');
CREATE TYPE tooth_status AS ENUM ('healthy', 'decayed', 'extracted', 'restored', 'crowned', 'implant', 'missing', 'endodontic');
CREATE TYPE pain_type AS ENUM ('spontaneous', 'provoked');
CREATE TYPE pain_quality AS ENUM ('acute', 'dull', 'pulsating');
CREATE TYPE pain_relief AS ENUM ('cold', 'heat', 'analgesics');
CREATE TYPE percussion_result AS ENUM ('positive', 'negative');
CREATE TYPE mobility_grade AS ENUM ('grade_1', 'grade_2', 'grade_3');
CREATE TYPE pulp_chamber_status AS ENUM ('normal', 'calcified', 'open');
CREATE TYPE canal_status AS ENUM ('visible', 'atretic', 'curvature');
CREATE TYPE periapical_status AS ENUM ('radiolucency', 'thickened_lp');
CREATE TYPE instrumentation_type AS ENUM ('manual', 'rotary_reciprocating');
CREATE TYPE obturation_type AS ENUM ('lateral_condensation', 'thermoplastic');
CREATE TYPE endodontic_activity AS ENUM (
  'opening',
  'biopulpectomy',
  'necropulpectomy',
  'conductometry',
  'instrumentation',
  'medication',
  'conometry',
  'obturation',
  'coronal_sealing',
  'postop_control',
  'distance_control'
);

-- ============================================================
-- PERFILES (extiende auth.users de Supabase)
-- ============================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  role        user_role NOT NULL DEFAULT 'doctor',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLÍNICAS
-- ============================================================

CREATE TABLE clinics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RELACIÓN DOCTOR ↔ CLÍNICA
-- ============================================================

CREATE TABLE doctor_clinics (
  doctor_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, clinic_id)
);

-- ============================================================
-- PACIENTES
-- Modelo de propiedad única: un paciente pertenece a un solo
-- doctor en todo momento (current_doctor_id).
-- created_by es inmutable: registra quién creó el paciente.
-- ============================================================

CREATE TABLE patients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  id_number         TEXT,                    -- Cédula / documento
  email             TEXT,
  phone             TEXT,
  date_of_birth     DATE,
  gender            TEXT,
  blood_type        TEXT,
  address           TEXT,
  created_by        UUID NOT NULL REFERENCES profiles(id),
  current_doctor_id UUID NOT NULL REFERENCES profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDITORÍA DE TRASPASOS DE PACIENTE
-- Registro inmutable de cada traspaso. El doctor original
-- pierde acceso en el momento del traspaso.
-- ============================================================

CREATE TABLE patient_transfers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  from_doctor_id   UUID NOT NULL REFERENCES profiles(id),
  to_doctor_id     UUID NOT NULL REFERENCES profiles(id),
  transferred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes            TEXT
);

-- ============================================================
-- HISTORIA CLÍNICA (raíz del expediente)
-- doctor_id = doctor que creó la historia (inmutable).
-- El acceso se determina por patients.current_doctor_id.
-- ============================================================

CREATE TABLE medical_histories (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id           UUID NOT NULL REFERENCES profiles(id),
  clinic_id           UUID REFERENCES clinics(id),
  currency            currency_type NOT NULL DEFAULT 'USD',
  last_dental_visit   DATE,
  emergency_contact   TEXT,
  signature_date      DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ANTECEDENTES MÉDICOS (página 1)
-- ============================================================

CREATE TABLE medical_backgrounds (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_history_id              UUID NOT NULL UNIQUE REFERENCES medical_histories(id) ON DELETE CASCADE,

  -- CARDIOVASCULAR
  cardio_heart_problems           BOOLEAN DEFAULT FALSE,
  cardio_rheumatic_fever          BOOLEAN DEFAULT FALSE,
  cardio_antibiotics_before       BOOLEAN DEFAULT FALSE,
  cardio_mitral_valve_prolapse    BOOLEAN DEFAULT FALSE,
  cardio_easy_fatigue             BOOLEAN DEFAULT FALSE,
  cardio_high_blood_pressure      BOOLEAN DEFAULT FALSE,

  -- SENTIDOS
  senses_ear_problems             BOOLEAN DEFAULT FALSE,
  senses_smell_taste_changes      BOOLEAN DEFAULT FALSE,
  senses_vision_problems          BOOLEAN DEFAULT FALSE,
  senses_bad_breath               BOOLEAN DEFAULT FALSE,

  -- RESPIRATORIO
  resp_frequent_flu               BOOLEAN DEFAULT FALSE,
  resp_tuberculosis               BOOLEAN DEFAULT FALSE,
  resp_asthma_sinusitis           BOOLEAN DEFAULT FALSE,
  resp_chronic_cough_blood        BOOLEAN DEFAULT FALSE,

  -- ENDOCRINO
  endo_diabetes                   BOOLEAN DEFAULT FALSE,
  endo_thyroid_problems           BOOLEAN DEFAULT FALSE,
  endo_thirst_frequent_urination  BOOLEAN DEFAULT FALSE,
  endo_other_glandular            BOOLEAN DEFAULT FALSE,

  -- NEUROLÓGICO
  neuro_psychiatric_treatment     BOOLEAN DEFAULT FALSE,
  neuro_thyroid_problems          BOOLEAN DEFAULT FALSE,
  neuro_frequent_depression       BOOLEAN DEFAULT FALSE,

  -- GÁSTRICO
  gastro_liver_problems           BOOLEAN DEFAULT FALSE,
  gastro_reflux_vomiting          BOOLEAN DEFAULT FALSE,
  gastro_ulcers                   BOOLEAN DEFAULT FALSE,
  gastro_frequent_diarrhea        BOOLEAN DEFAULT FALSE,
  gastro_unexplained_weight_loss  BOOLEAN DEFAULT FALSE,

  -- RENAL
  renal_kidney_problems           BOOLEAN DEFAULT FALSE,
  renal_sti                       BOOLEAN DEFAULT FALSE,

  -- INMUNOLÓGICO
  immun_drug_allergy              BOOLEAN DEFAULT FALSE,
  immun_autoimmune_disease        BOOLEAN DEFAULT FALSE,
  immun_immunosuppressants        BOOLEAN DEFAULT FALSE,

  -- SANGRE
  blood_anemia                    BOOLEAN DEFAULT FALSE,
  blood_leukemia                  BOOLEAN DEFAULT FALSE,
  blood_easy_bleeding             BOOLEAN DEFAULT FALSE,

  -- MUJER
  female_contraceptives           BOOLEAN DEFAULT FALSE,
  female_osteoporosis             BOOLEAN DEFAULT FALSE,
  female_pregnant                 BOOLEAN DEFAULT FALSE,
  female_breastfeeding            BOOLEAN DEFAULT FALSE,

  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXAMEN CLÍNICO (página 2)
-- ============================================================

CREATE TABLE dental_exams (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_history_id      UUID NOT NULL UNIQUE REFERENCES medical_histories(id) ON DELETE CASCADE,

  -- Lista de problemas
  problem_atm             BOOLEAN DEFAULT FALSE,
  problem_crowding        BOOLEAN DEFAULT FALSE,
  problem_periodontitis   BOOLEAN DEFAULT FALSE,
  problem_gingivitis      BOOLEAN DEFAULT FALSE,
  problem_habits          BOOLEAN DEFAULT FALSE,
  problem_takes_aspirin   BOOLEAN DEFAULT FALSE,
  problem_wisdom_extract  BOOLEAN DEFAULT FALSE,

  -- Estado de erupción de cordales
  eruption_status         eruption_status,

  -- Campos de texto libre
  specifications          TEXT,
  observations            TEXT,
  definitive_diagnosis    TEXT,
  treatment_plan_notes    TEXT,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ODONTOGRAMA — una fila por pieza dental (notación FDI)
-- Piezas superiores: 11-18, 21-28
-- Piezas inferiores: 31-38, 41-48
-- ============================================================

CREATE TABLE tooth_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_exam_id    UUID NOT NULL REFERENCES dental_exams(id) ON DELETE CASCADE,
  tooth_number      INTEGER NOT NULL CHECK (
                      tooth_number BETWEEN 11 AND 18 OR
                      tooth_number BETWEEN 21 AND 28 OR
                      tooth_number BETWEEN 31 AND 38 OR
                      tooth_number BETWEEN 41 AND 48
                    ),
  vestibular_status tooth_status DEFAULT 'healthy',
  lingual_status    tooth_status DEFAULT 'healthy',
  notes             TEXT,
  UNIQUE (dental_exam_id, tooth_number)
);

-- ============================================================
-- ENDODONCIA (páginas 3 y 4)
-- ============================================================

CREATE TABLE endodontics (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_history_id        UUID NOT NULL REFERENCES medical_histories(id) ON DELETE CASCADE,
  tooth_number              INTEGER NOT NULL,

  -- 1. Anamnesis y sintomatología
  pain_type                 pain_type,
  pain_intensity            INTEGER CHECK (pain_intensity BETWEEN 1 AND 10),
  pain_quality              pain_quality,
  pain_relief               pain_relief,

  -- 2. Examen clínico
  percussion_vertical       percussion_result,
  percussion_horizontal     percussion_result,
  palpation_apical          percussion_result,
  palpation_gum             percussion_result,
  mobility_grade            mobility_grade,
  thermal_tests             TEXT,

  -- 3. Examen radiográfico
  pulp_chamber              pulp_chamber_status,
  canals                    canal_status,
  periapical_zone           periapical_status,

  -- 4. Diagnóstico
  pulp_diagnosis            TEXT,
  periapical_diagnosis      TEXT,

  -- 5. Conductometría
  canal_name                TEXT,
  canal_reference           TEXT,
  canal_length              TEXT,

  -- 6. Protocolo de tratamiento
  irrigation_naocl_pct      DECIMAL(5,2),
  irrigation_edta           BOOLEAN DEFAULT FALSE,
  instrumentation           instrumentation_type,
  obturation                obturation_type,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SESIONES DE ENDODONCIA — cronograma (página 4)
-- ============================================================

CREATE TABLE endodontic_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endodontic_id   UUID NOT NULL REFERENCES endodontics(id) ON DELETE CASCADE,
  session_date    DATE,
  activity        endodontic_activity NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLAN DE TRATAMIENTO — ítems con costo (página 5)
-- ============================================================

CREATE TABLE treatment_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_history_id  UUID NOT NULL REFERENCES medical_histories(id) ON DELETE CASCADE,
  item_number         INTEGER NOT NULL CHECK (item_number BETWEEN 1 AND 33),
  description         TEXT NOT NULL,
  cost                DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- La moneda se hereda de medical_histories.currency
  UNIQUE (medical_history_id, item_number)
);

-- ============================================================
-- PAGOS Y SEGUIMIENTO FINANCIERO (página 5 — tabla inferior)
-- ============================================================

CREATE TABLE treatment_payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_history_id  UUID NOT NULL REFERENCES medical_histories(id) ON DELETE CASCADE,
  payment_date        DATE NOT NULL,
  tooth_unit          TEXT,               -- U.D. (unidad dental)
  clinical_activity   TEXT NOT NULL,
  cost                DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment             DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance             DECIMAL(12,2) GENERATED ALWAYS AS (cost - payment) STORED,
  -- La moneda se hereda de medical_histories.currency
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADJUNTOS — radiografías, imágenes, PDFs
-- ============================================================

CREATE TABLE attachments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_history_id  UUID NOT NULL REFERENCES medical_histories(id) ON DELETE CASCADE,
  file_url            TEXT NOT NULL,      -- Supabase Storage path (no URL pública)
  file_type           TEXT,
  description         TEXT,
  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_patients_current_doctor ON patients(current_doctor_id);
CREATE INDEX idx_patient_transfers_patient ON patient_transfers(patient_id);
CREATE INDEX idx_patient_transfers_from ON patient_transfers(from_doctor_id);
CREATE INDEX idx_patient_transfers_to ON patient_transfers(to_doctor_id);
CREATE INDEX idx_medical_histories_patient ON medical_histories(patient_id);
CREATE INDEX idx_medical_histories_doctor ON medical_histories(doctor_id);
CREATE INDEX idx_treatment_payments_history ON treatment_payments(medical_history_id);
CREATE INDEX idx_endodontics_history ON endodontics(medical_history_id);
CREATE INDEX idx_tooth_records_exam ON tooth_records(dental_exam_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_clinics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_transfers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_histories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_exams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE endodontics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE endodontic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments         ENABLE ROW LEVEL SECURITY;

-- Cada doctor ve y edita solo su propio perfil
CREATE POLICY "doctor_own_profile" ON profiles
  FOR ALL USING (id = auth.uid());

-- Doctor ve sus clínicas y las que creó
CREATE POLICY "doctor_own_clinics" ON clinics
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "doctor_clinic_membership" ON doctor_clinics
  FOR ALL USING (doctor_id = auth.uid());

-- Pacientes: solo el propietario actual (current_doctor_id)
CREATE POLICY "owner_sees_patients" ON patients
  FOR SELECT USING (current_doctor_id = auth.uid());

CREATE POLICY "owner_creates_patients" ON patients
  FOR INSERT WITH CHECK (created_by = auth.uid() AND current_doctor_id = auth.uid());

CREATE POLICY "owner_updates_patients" ON patients
  FOR UPDATE USING (current_doctor_id = auth.uid());

-- Traspasos: el doctor puede ver los traspasos en los que participó
CREATE POLICY "doctor_sees_own_transfers" ON patient_transfers
  FOR SELECT USING (from_doctor_id = auth.uid() OR to_doctor_id = auth.uid());

CREATE POLICY "doctor_creates_transfers" ON patient_transfers
  FOR INSERT WITH CHECK (from_doctor_id = auth.uid());

-- Historias clínicas: acceso por propiedad actual del paciente
CREATE POLICY "owner_sees_histories" ON medical_histories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = medical_histories.patient_id
        AND patients.current_doctor_id = auth.uid()
    )
  );

-- Tablas hijas: acceso a través de la propiedad actual del paciente
CREATE POLICY "owner_medical_background" ON medical_backgrounds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medical_histories mh
      JOIN patients p ON p.id = mh.patient_id
      WHERE mh.id = medical_history_id
        AND p.current_doctor_id = auth.uid()
    )
  );

CREATE POLICY "owner_dental_exams" ON dental_exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medical_histories mh
      JOIN patients p ON p.id = mh.patient_id
      WHERE mh.id = medical_history_id
        AND p.current_doctor_id = auth.uid()
    )
  );

CREATE POLICY "owner_tooth_records" ON tooth_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM dental_exams de
      JOIN medical_histories mh ON mh.id = de.medical_history_id
      JOIN patients p ON p.id = mh.patient_id
      WHERE de.id = dental_exam_id
        AND p.current_doctor_id = auth.uid()
    )
  );

CREATE POLICY "owner_endodontics" ON endodontics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medical_histories mh
      JOIN patients p ON p.id = mh.patient_id
      WHERE mh.id = medical_history_id
        AND p.current_doctor_id = auth.uid()
    )
  );

CREATE POLICY "owner_endodontic_sessions" ON endodontic_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM endodontics e
      JOIN medical_histories mh ON mh.id = e.medical_history_id
      JOIN patients p ON p.id = mh.patient_id
      WHERE e.id = endodontic_id
        AND p.current_doctor_id = auth.uid()
    )
  );

CREATE POLICY "owner_treatment_items" ON treatment_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medical_histories mh
      JOIN patients p ON p.id = mh.patient_id
      WHERE mh.id = medical_history_id
        AND p.current_doctor_id = auth.uid()
    )
  );

CREATE POLICY "owner_treatment_payments" ON treatment_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medical_histories mh
      JOIN patients p ON p.id = mh.patient_id
      WHERE mh.id = medical_history_id
        AND p.current_doctor_id = auth.uid()
    )
  );

CREATE POLICY "owner_attachments" ON attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM medical_histories mh
      JOIN patients p ON p.id = mh.patient_id
      WHERE mh.id = medical_history_id
        AND p.current_doctor_id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_medical_histories_updated
  BEFORE UPDATE ON medical_histories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_medical_backgrounds_updated
  BEFORE UPDATE ON medical_backgrounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_dental_exams_updated
  BEFORE UPDATE ON dental_exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_endodontics_updated
  BEFORE UPDATE ON endodontics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- sql de migración (aplicar manualmente en supabase sql editor)
-- ============================================================
--
-- si ya existe la base en producción, ejecutar este bloque para
-- migrar del modelo doctor_patients al modelo de propiedad única:
--
-- begin;
--
-- -- 1. agregar current_doctor_id a patients
-- alter table patients
--   add column current_doctor_id uuid references profiles(id);
--
-- -- 2. backfill: asignar como propietario al doctor original
-- update patients set current_doctor_id = created_by;
--
-- -- 3. hacer la columna not null
-- alter table patients
--   alter column current_doctor_id set not null;
--
-- -- 4. crear tabla de auditoría de traspasos
-- create table patient_transfers (
--   id               uuid primary key default gen_random_uuid(),
--   patient_id       uuid not null references patients(id) on delete cascade,
--   from_doctor_id   uuid not null references profiles(id),
--   to_doctor_id     uuid not null references profiles(id),
--   transferred_at   timestamptz not null default now(),
--   notes            text
-- );
--
-- -- 5. crear índices nuevos
-- create index idx_patients_current_doctor on patients(current_doctor_id);
-- create index idx_patient_transfers_patient on patient_transfers(patient_id);
-- create index idx_patient_transfers_from on patient_transfers(from_doctor_id);
-- create index idx_patient_transfers_to on patient_transfers(to_doctor_id);
--
-- -- 6. actualizar rls de patients
-- drop policy if exists "doctor_sees_own_patients" on patients;
-- drop policy if exists "doctor_creates_patients" on patients;
-- drop policy if exists "doctor_updates_own_patients" on patients;
-- create policy "owner_sees_patients" on patients
--   for select using (current_doctor_id = auth.uid());
-- create policy "owner_creates_patients" on patients
--   for insert with check (created_by = auth.uid() and current_doctor_id = auth.uid());
-- create policy "owner_updates_patients" on patients
--   for update using (current_doctor_id = auth.uid());
--
-- -- 7. habilitar rls en patient_transfers
-- alter table patient_transfers enable row level security;
-- create policy "doctor_sees_own_transfers" on patient_transfers
--   for select using (from_doctor_id = auth.uid() or to_doctor_id = auth.uid());
-- create policy "doctor_creates_transfers" on patient_transfers
--   for insert with check (from_doctor_id = auth.uid());
--
-- -- 8. actualizar rls de historias clínicas y tablas hijas
-- drop policy if exists "doctor_own_histories" on medical_histories;
-- create policy "owner_sees_histories" on medical_histories
--   for all using (
--     exists (
--       select 1 from patients
--       where patients.id = medical_histories.patient_id
--         and patients.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_medical_background" on medical_backgrounds;
-- create policy "owner_medical_background" on medical_backgrounds
--   for all using (
--     exists (
--       select 1 from medical_histories mh
--       join patients p on p.id = mh.patient_id
--       where mh.id = medical_history_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_dental_exams" on dental_exams;
-- create policy "owner_dental_exams" on dental_exams
--   for all using (
--     exists (
--       select 1 from medical_histories mh
--       join patients p on p.id = mh.patient_id
--       where mh.id = medical_history_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_tooth_records" on tooth_records;
-- create policy "owner_tooth_records" on tooth_records
--   for all using (
--     exists (
--       select 1 from dental_exams de
--       join medical_histories mh on mh.id = de.medical_history_id
--       join patients p on p.id = mh.patient_id
--       where de.id = dental_exam_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_endodontics" on endodontics;
-- create policy "owner_endodontics" on endodontics
--   for all using (
--     exists (
--       select 1 from medical_histories mh
--       join patients p on p.id = mh.patient_id
--       where mh.id = medical_history_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_endodontic_sessions" on endodontic_sessions;
-- create policy "owner_endodontic_sessions" on endodontic_sessions
--   for all using (
--     exists (
--       select 1 from endodontics e
--       join medical_histories mh on mh.id = e.medical_history_id
--       join patients p on p.id = mh.patient_id
--       where e.id = endodontic_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_treatment_items" on treatment_items;
-- create policy "owner_treatment_items" on treatment_items
--   for all using (
--     exists (
--       select 1 from medical_histories mh
--       join patients p on p.id = mh.patient_id
--       where mh.id = medical_history_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_treatment_payments" on treatment_payments;
-- create policy "owner_treatment_payments" on treatment_payments
--   for all using (
--     exists (
--       select 1 from medical_histories mh
--       join patients p on p.id = mh.patient_id
--       where mh.id = medical_history_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- drop policy if exists "doctor_attachments" on attachments;
-- create policy "owner_attachments" on attachments
--   for all using (
--     exists (
--       select 1 from medical_histories mh
--       join patients p on p.id = mh.patient_id
--       where mh.id = medical_history_id and p.current_doctor_id = auth.uid()
--     )
--   );
--
-- -- 9. eliminar tabla y política doctor_patients
-- drop policy if exists "doctor_patient_access" on doctor_patients;
-- drop table if exists doctor_patients;
--
-- commit;
