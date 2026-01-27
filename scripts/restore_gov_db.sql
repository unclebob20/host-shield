-- Full restore script for hostshield_gov_db (Postgres)
-- Includes: Key Schema Tables, Migrations, and Seed Data (Templates/XSD)

CREATE EXTENSION IF NOT EXISTS plpgsql;

-- 1. Schema Tables
CREATE TABLE IF NOT EXISTS delayed_jobs (
    id SERIAL PRIMARY KEY,
    priority integer DEFAULT 0 NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    handler text NOT NULL,
    last_error text,
    run_at timestamp without time zone,
    locked_at timestamp without time zone,
    failed_at timestamp without time zone,
    locked_by character varying,
    queue character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);
CREATE INDEX IF NOT EXISTS delayed_jobs_priority ON delayed_jobs(priority, run_at);

CREATE TABLE IF NOT EXISTS form_templates (
    id BIGSERIAL PRIMARY KEY,
    identifier character varying NOT NULL,
    version_major integer NOT NULL,
    version_minor integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS index_form_templates_on_identifier_and_version ON form_templates(identifier, version_major, version_minor);

CREATE TABLE IF NOT EXISTS form_template_related_documents (
    id BIGSERIAL PRIMARY KEY,
    form_template_id bigint NOT NULL,
    data character varying NOT NULL,
    language character varying NOT NULL,
    document_type character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    CONSTRAINT fk_rails_form_template FOREIGN KEY (form_template_id) REFERENCES form_templates(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS index_related_documents_on_template_id_and_language_and_type ON form_template_related_documents(form_template_id, language, document_type);
CREATE INDEX IF NOT EXISTS index_form_template_related_documents_on_form_template_id ON form_template_related_documents(form_template_id);

CREATE TABLE IF NOT EXISTS heartbeats (
    id BIGSERIAL PRIMARY KEY,
    name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS index_heartbeats_on_name ON heartbeats(name);

CREATE TABLE IF NOT EXISTS schema_migrations (version character varying PRIMARY KEY);
INSERT INTO schema_migrations (version) VALUES ('20181219193446') ON CONFLICT DO NOTHING;

-- 2. Seed Data: Form Template (App.GeneralAgenda v1.9)
INSERT INTO form_templates (identifier, version_major, version_minor, created_at, updated_at)
VALUES ('App.GeneralAgenda', 1, 9, NOW(), NOW());

-- 3. Seed Data: XSD Definition (Permissive)
INSERT INTO form_template_related_documents (form_template_id, data, language, document_type, created_at, updated_at)
VALUES (
    (SELECT id FROM form_templates WHERE identifier = 'App.GeneralAgenda' AND version_major = 1 LIMIT 1),
    '<?xml version="1.0" encoding="UTF-8"?><xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified"><xs:element name="RegistrationOfStay"><xs:complexType><xs:sequence><xs:any minOccurs="0" maxOccurs="unbounded" processContents="skip"/></xs:sequence><xs:anyAttribute processContents="skip"/></xs:complexType></xs:element></xs:schema>', 
    'sk', 
    'CLS_F_XSD_EDOC', 
    NOW(), 
    NOW()
);
