# 1. Introduction

## 1.1 Purpose and Audience

This document provides the functional specifications for the Wind Power Plant Status Investigation Application. The application enables field technicians and project managers to conduct systematic inspections of wind turbine powerplants, document findings, and generate comprehensive status reports.

**Primary Audience:**
- Software developers implementing the application
- Quality assurance engineers creating test plans
- Project managers overseeing development
- System architects designing the technical solution

**Secondary Audience:**
- End users (field technicians and project managers) for understanding system capabilities
- Business stakeholders for validation of requirements

## 1.2 Definitions and Abbreviations

**Powerplant**: A wind power installation consisting of multiple wind turbines at a specific location. Each powerplant has a unique identifier and name.

**Part**: A physical component of a wind turbine (rotor blades, gearbox, generator, tower, nacelle). Each part has associated checkups.

**Checkup**: A specific inspection point or test procedure for a wind turbine part. Each checkup must be evaluated and assigned a status during project execution.

**Project**: An investigation assignment for a specific powerplant. A project is assigned to a user, tracks the status of all checkups, and can be marked as Finished when the report is generated.

**Status**: The evaluation result for a checkup. Valid values are: bad, average, good.

**Project Status**: The overall state of a project. Valid values are: In Progress, Finished.

**User**: An authenticated person who can be assigned projects. Users register and login to access the system.

**Report**: A PDF document generated from a project containing all parts, checkups, their statuses, and associated documentation.

**Documentation**: Images and text descriptions stored in the database for each checkup, providing reference information during inspections.

## 1.3 General Presentation

The Wind Power Plant Status Investigation Application is a web-based system that streamlines the process of inspecting wind turbine installations. The application provides a structured workflow for:

1. User authentication and project assignment
2. Project creation and initialization
3. Systematic inspection of wind turbine parts and checkups
4. Status tracking and documentation management
5. Report generation and project completion

The system maintains a database of powerplants with their associated parts and checkups, allowing users to select a powerplant and automatically load all required inspection points. Users document their findings by setting status values for each checkup and can reference existing documentation (images and descriptions) stored in the database.

The application ensures consistency in inspection procedures by using predefined checkup lists for each powerplant, while providing flexibility for users to document their specific findings through status assignments.
