package com.xeepl.erp.exception;

/**
 * Thrown when an entity is not found by id or other search.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
    public ResourceNotFoundException(String message, Throwable cause) { super(message, cause); }
}
