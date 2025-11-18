# 1 - Introduction

## Purpose and Audience of the Document

This document defines the functional specifications for the Wind Power Plant Status Investigation App, a new system to be developed. The application enables field inspectors to conduct systematic checkups of wind turbine powerplants, track the status of various components, and generate comprehensive PDF reports.

The Wind Power Plant Status Investigation App supports the business objective of standardizing and digitizing wind power plant inspection processes. It replaces manual paper-based reporting with a digital solution that ensures consistency, traceability, and efficiency in maintenance operations. The system aligns with strategic goals of improving operational data quality, reducing inspection time, and enabling better decision-making through structured status tracking.

This document is intended for:
- Software developers implementing the system
- Project managers overseeing development
- Quality assurance teams creating test plans
- Business stakeholders reviewing requirements
- System architects designing the technical solution

## Definitions – Abbreviations

**Wind Turbine**: A device that converts wind energy into electrical power. Each turbine consists of multiple mechanical and electrical components.

**Powerplant**: A collection of wind turbines located at a specific site. A powerplant contains multiple turbines that share common infrastructure.

**Checkup**: A specific inspection task performed on a component or part of a wind turbine. Each checkup has a status that can be set to bad, average, or good.

**Part**: A component or subsystem of a wind turbine that requires inspection. Examples include blades, gearbox, generator, tower, nacelle, and electrical systems.

**Project**: An inspection assignment for a specific powerplant assigned to a user. A project has a status of either "In Progress" or "Finished".

**Project Status**: The current state of an inspection project. Status values are "In Progress" (active inspection) or "Finished" (completed with PDF generated).

**Field Inspector**: A user role representing technicians who perform on-site inspections of wind power plants.

**PDF Report**: A generated document containing all checkup statuses, parts information, and associated documentation for a completed project.

**Database**: The persistent storage system containing powerplant data, parts, checkups, projects, user information, and documentation files (images and descriptions).

## General Presentation of the Document

This functional specification document is organized into four main chapters:

**Chapter 1 - Introduction**: Provides context, definitions, and document structure. This section establishes the foundation for understanding the system's purpose and terminology.

**Chapter 2 - General Description**: Describes the system's environment, conceptual model, user characteristics, development constraints, and working assumptions. This chapter provides the high-level system context.

**Chapter 3 - Functional Requirements**: Details all use cases that the system must support. Each use case is described with actors, inputs, processing actions, and outputs. This chapter defines what the system must do.

**Chapter 4 - Screens**: Describes the user interface structure, navigation patterns, and detailed specifications for each screen. This chapter defines how users interact with the system.

The document uses definitive language to specify requirements. All decisions are final and explicit, with no optional features or ambiguous statements.
