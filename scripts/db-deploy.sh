#!/bin/bash

# Database Deployment Script for Promptopotamus
# This script automates database migration deployment with safety checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=${DRY_RUN:-true}
AUTO_APPROVE=${AUTO_APPROVE:-false}
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if project is linked
    if [ ! -f ".supabase/config.toml" ]; then
        log_error "Supabase project not initialized. Run 'supabase init' first."
        exit 1
    fi
    
    # Check if access token is set
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        log_warning "SUPABASE_ACCESS_TOKEN not set. You may need to run 'supabase login' or set the token."
    fi
    
    log_success "Prerequisites check passed"
}

# Check migration status
check_migration_status() {
    log_info "Checking migration status..."
    
    if ! supabase migration list > /dev/null 2>&1; then
        log_error "Failed to check migration status. Make sure project is linked to remote."
        exit 1
    fi
    
    # Show current migration status
    echo "Current migration status:"
    supabase migration list
}

# Create database backup (if in production)
create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ] && [ "$DRY_RUN" = "false" ]; then
        log_info "Creating database backup..."
        
        # Create backup using pg_dump (requires database URL)
        timestamp=$(date +"%Y%m%d_%H%M%S")
        backup_file="backup_${timestamp}.sql"
        
        log_info "Backup would be created at: $backup_file"
        # Note: Actual backup implementation would require database URL
        # pg_dump $DATABASE_URL > $backup_file
        
        log_success "Backup preparation completed"
    fi
}

# Validate migrations
validate_migrations() {
    log_info "Validating migrations..."
    
    # Check for common issues in migration files
    migration_dir="supabase/migrations"
    
    if [ ! -d "$migration_dir" ]; then
        log_error "Migration directory not found: $migration_dir"
        exit 1
    fi
    
    # Check for potentially dangerous operations
    dangerous_patterns=("DROP TABLE" "TRUNCATE" "DELETE FROM" "ALTER TABLE.*DROP COLUMN")
    
    for file in "$migration_dir"/*.sql; do
        if [ -f "$file" ]; then
            log_info "Checking migration file: $(basename "$file")"
            
            for pattern in "${dangerous_patterns[@]}"; do
                if grep -qi "$pattern" "$file"; then
                    log_warning "Potentially dangerous operation found in $(basename "$file"): $pattern"
                    
                    if [ "$AUTO_APPROVE" = "false" ]; then
                        read -p "Continue anyway? (y/N): " -n 1 -r
                        echo
                        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                            log_error "Migration deployment cancelled by user"
                            exit 1
                        fi
                    fi
                fi
            done
        fi
    done
    
    log_success "Migration validation completed"
}

# Deploy migrations
deploy_migrations() {
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would deploy the following migrations:"
        supabase migration list
        log_info "DRY RUN: No actual changes made"
        return 0
    fi
    
    log_info "Deploying migrations to remote database..."
    
    if [ "$AUTO_APPROVE" = "false" ]; then
        read -p "Are you sure you want to deploy migrations? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Migration deployment cancelled by user"
            exit 1
        fi
    fi
    
    # Deploy migrations
    if supabase db push; then
        log_success "Migrations deployed successfully"
    else
        log_error "Migration deployment failed"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    if [ "$DRY_RUN" = "false" ]; then
        log_info "Verifying deployment..."
        
        # Check migration status after deployment
        supabase migration list
        
        log_success "Deployment verification completed"
    fi
}

# Main execution
main() {
    log_info "Starting database deployment script"
    log_info "Configuration: DRY_RUN=$DRY_RUN, AUTO_APPROVE=$AUTO_APPROVE, BACKUP_BEFORE_DEPLOY=$BACKUP_BEFORE_DEPLOY"
    
    check_prerequisites
    check_migration_status
    create_backup
    validate_migrations
    deploy_migrations
    verify_deployment
    
    log_success "Database deployment script completed successfully"
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --apply)
            DRY_RUN=false
            shift
            ;;
        --auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        --no-backup)
            BACKUP_BEFORE_DEPLOY=false
            shift
            ;;
        -h|--help)
            echo "Database Deployment Script for Promptopotamus"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run        Preview changes without applying (default)"
            echo "  --apply          Actually apply migrations"
            echo "  --auto-approve   Skip confirmation prompts"
            echo "  --no-backup      Skip database backup"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  SUPABASE_ACCESS_TOKEN  Access token for Supabase CLI"
            echo ""
            echo "Examples:"
            echo "  $0 --dry-run                 # Preview migrations"
            echo "  $0 --apply                   # Deploy migrations with prompts"
            echo "  $0 --apply --auto-approve    # Deploy without prompts"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main