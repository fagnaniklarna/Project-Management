# Background

**Win Top MoR PM Tool** is a comprehensive CRM-style project management platform designed for Solution Engineers and Delivery Managers. Its primary goal is to track and manage relationships and operational details for acquiring partners such as Stripe, JPMorgan Chase, Adyen, Worldpay, and others. The tool centralizes partner data, assignments, and performance metrics, supporting effective project delivery and collaboration.

## Overview

This is the single source of truth for Acquiring Partner status, linked materials, blockers, dependencies, and more for Klarna Network. The tool provides a framework to track an Acquiring Partner, any of its sub-PSPs or Gateways, and all its different integration paths. For example, Stripe has approximately 13 different integrations that must be tracked independently. The system must monitor the Klarna Network implementation status across these paths:
- Is xFeature available on OCS?
- Within OCS, is it available on payment link, checkout, etc.?
- Outside of OCS, is it available on payment intent?

Once the Klarna Network (KN) Feature List https://docs.google.com/spreadsheets/d/1axzNFLVvnWlUWT4nmQoc__K76suAb5OcSq-qZOfyAVc/edit?gid=367178195#gid=367178195 is fully established, the tool should track which features and functionalities have been implemented by each Acquiring Partner, including timelines for when partners are expected to support each feature per integration path.

### Internal Use Cases for the Win Top MoR PM Tool
The feature list is used by the Win Top MoR group—including solutions & delivery, commercial resources, and KN Leadership—to align on:
- What features are available for our partners and when
- Which integration patterns are supported (Server-side, Web SDK, Mobile SDK) per acquiring partner
- Status of acquiring partner implementations and phase details
- Risks, blockers, or dependencies for Acquiring Partner go-live
- Central hub for project overviews, technical details, timelines, resource allocation, risks, dependencies, notes, and documentation links

Beyond project management, this list also underpins:
- Capacity planning for technical resources
- Integration health and readiness

---

## Key Features

- **Partner Management:** Create, edit, and track acquiring partners (APs), including overarching APs (e.g., Nexi Relay, Nomupay).
- **Sub-Entity Tracking:** Manage sub-PSPs and gateways under each AP, treating them as related sub-projects. Each sub-entity can have its own integration work, milestones, and status.
- **Team Assignment:** Assign partners and their sub-entities to specific teams based on Leap categories (Red, Cobalt, Platinum, Black).
- **Owner Management:** Designate primary and secondary technical points of contact for each project and sub-entity.
- **Business Developer Assignment:** Assign responsible business developers for each project or sub-entity.
- **Project Metadata:** Track project identifiers, names, types (multi-select), priority, start and target go-live dates, status/stage, next milestone, dependencies, risks/blockers, and resource allocation.
- **Integration Path Tracking:** For each AP and sub-PSP/gateway, specify integration types (REST API, WebSDK, Plugin, MobileSDK, In-Store) and track which functionalities have been implemented per integration path.
- **Testing & Health:** Monitor testing status (Not Started, In Progress, Passed, Blocked), health score, and estimated volume ($).
- **Action & Task Management:** Log actions, tasks, and progress for each partner and sub-entity.
- **Search & Filtering:** Find partners or sub-entities by name, team, owner, status, and other attributes.
- **Status Management:** Track project and integration status/stage (Discovery, Scoping, Development, Testing, IQR, CLR, Launch, Live, Paused).
- **Linked Documentation:** Attach notes, comments, and hyperlinks to relevant docs for each project and sub-entity.
- **Audit & Updates:** Record the last updated date and maintain a clear change log.
- **Database:** The database is not yet created outside of this README and a few other Google Sheets.
- **Datamodel:** Research and document the current and planned data model within this file.
- **UX-Klarna-View:** The initial UX should focus on a “Win Top MoR Account Management” view; this is the first priority before expanding further.
- **UX-Klarna-View:** Implement a project management style view, listing acquiring partner accounts from a high level, with deep-dive overlays showing details. Detail overlays should have tabs for different information layers.

---

## Data Model Design

Entities and fields to support the schema and requirements:

- **Project (Acquiring Partner):**
  - `project_id` (e.g. KN-0001)
  - `project_name`
  - `account_name`
  - `project_type` (multi-select)
  - `status_stage`
  - `priority`
  - `start_date`
  - `target_go_live_date`
  - `owning_team`
  - `primary_technical_poc`
  - `secondary_technical_poc`
  - `business_developer`
  - `next_milestone`
  - `dependencies`
  - `risks_blockers`
  - `resource_allocation`
  - `estimated_volume`
  - `health_score`
  - `last_updated`
  - `notes_comments`
  - `linked_docs`
  - **Relationships:** Has many Sub-Entities

- **Sub-Entity (Sub-PSP/Gateway):**
  - `sub_entity_id`
  - `parent_project_id`
  - `name`
  - `integration_type` (multi-select)
  - `testing_status`
  - `status_stage`
  - `milestones`
  - `implemented_functionalities` (list per integration path)
  - `owners` (primary/secondary)
  - `business_developer`
  - `notes_comments`
  - `linked_docs`
  - **Relationships:** Belongs to Project

- **User:**
  - `user_id`
  - `name`
  - `role` (e.g. Solution Engineer, Business Developer, Delivery Manager)
  - **Relationships:** Can be assigned to Projects/Sub-Entities

- **Team:**
  - `team_id`
  - `name`
  - `leap_category`
  - **Relationships:** Owns Projects/Sub-Entities

- **Action/Task:**
  - `task_id`
  - `project_id` or `sub_entity_id`
  - `description`
  - `status`
  - `assignee`
  - `due_date`

---

## 🔗 References
- Current Project Tracker Example: [Nomupay example](https://docs.google.com/spreadsheets/d/17TSp8-MpJ4CQrGi7IoOerwuxsWmHefDY8HBBDQoYOFo/edit?gid=1186085164#gid=1186085164)
- Current AP Timelines Tracker: AP Timelines tab https://docs.google.com/spreadsheets/d/1axzNFLVvnWlUWT4nmQoc__K76suAb5OcSq-qZOfyAVc/edit?gid=367178195#gid=367178195
- Design System: Klarna Bubble UI — Keep and follow UX principles
- API Endpoint: pinkbase-proxy-eu.production.c2c.klarna.net — Data model is here (continue to use)

**Integration Path Tracking:**  
For each acquiring partner and its sub-entities, maintain a record of integration paths (REST API, WebSDK, etc.) and functionalities completed per path. This allows clear visibility for both overarching partners and their associated sub-projects.

---

_Refer back to this prompt to keep your implementation aligned with the evolving requirements and schema._
