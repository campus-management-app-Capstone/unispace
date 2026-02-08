// for clerk custom jwt session claims because include role metadata
export { };

// declare adding something in clerk (the role), global make it can be access everywhere
declare global {
    // interface = description of how object look like, CustomJwtSessionClaims is interface provided by clerk because we may need to add other attributes
    interface CustomJwtSessionClaims {
        // add role metadata
        metadata: {
            role?: "admin" | "student" | "lecturer";
        };
    }
}
