
/**
 * Tool Governance Policy
 * Defines which roles can access which tools and which tools require human approval.
 */

export const TOOL_ALLOWLIST: Record<string, string[]> = {
    'admin': ['*'], // Admin has access to all tools (still subject to approval flow)
    'dentist': [
        'create_prescription',
        'view_patient',
        'create_appointment',
        'view_clinical_record',
        'create_clinical_record',
        'search_procedures'
    ],
    'receptionist': [
        'create_appointment',
        'view_patient',
        'create_patient',
        'view_appointments',
        'reschedule_appointment'
    ],
    'patient': [
        'view_own_appointments' // Very limited scope
    ]
};

// Tools that are destructive or financials and require "Human-in-the-Loop"
// Instead of executing, the AI should return a "PROPOSAL" for the user to confirm in UI.
export const SENSITIVE_TOOLS = [
    'create_prescription',
    'create_payment',
    'refund_payment',
    'delete_appointment',
    'send_lab_order'
];

export const canUseTool = (role: string, toolName: string): boolean => {
    const allowed = TOOL_ALLOWLIST[role] || [];
    if (allowed.includes('*')) return true;
    return allowed.includes(toolName);
};

export const requiresApproval = (toolName: string): boolean => {
    return SENSITIVE_TOOLS.includes(toolName);
};
