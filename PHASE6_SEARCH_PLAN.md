# Phase 6: Search Functionality Implementation Plan

## Overview
Implement comprehensive search functionality to help users find their files efficiently across names, types, dates, and metadata.

## Current State Analysis
- Frontend has search UI (input field) but backend doesn't process search queries
- Frontend sends search parameters but they're ignored by API
- No filtering or sorting implemented in backend
- Content search not available (encrypted files limitation)

## Architecture

### Search Types
1. **File Name Search**: Primary search across `originalName` field
2. **File Type Filtering**: Filter by MIME type categories
3. **Date Filtering**: Filter by upload date ranges
4. **Metadata Search**: Search in folder names, sizes, etc.
5. **Content Search**: Future enhancement (limited for encrypted files)

### Database Strategy
- Use PostgreSQL `ILIKE` for case-insensitive text search
- Add indexes on frequently searched columns
- Consider full-text search vectors for advanced features

### API Design
```
GET /files?search=term&type=image&dateFrom=2024-01&sortBy=name&sortOrder=asc
```

## Implementation Plan

### Phase 1: Basic Search
1. **Backend Search API**
   - Update `FileController.index()` to process search parameters
   - Implement name search with `ILIKE`
   - Add type filtering logic
   - Implement sorting (name, size, date)

2. **Database Optimization**
   - Add indexes on `original_name`, `mime_type`, `created_at`
   - Analyze query performance

3. **Frontend Integration**
   - Verify search parameters are sent correctly
   - Test search results display

### Phase 2: Advanced Filtering
1. **Date Range Filtering**
   - Add `dateFrom` and `dateTo` parameters
   - Filter by `created_at` date ranges

2. **File Type Categories**
   - Image, Video, Document, Archive, Audio
   - Map MIME types to categories

3. **Size Filtering**
   - Add size range filters
   - Useful for large file management

### Phase 3: Enhanced Search (Future)
1. **Full-Text Search**
   - PostgreSQL `tsvector` for advanced text search
   - Stemming and relevance scoring

2. **Content Search**
   - Text extraction from PDFs, docs, txt files
   - Skip encrypted files (security consideration)
   - Index extracted text

3. **Search Suggestions**
   - Autocomplete based on existing filenames
   - Recent searches history

## Technical Details

### Backend Changes
```typescript
// FileController.index()
const { search, type, sortBy, sortOrder, dateFrom, dateTo } = request.qs()

let query = File.query().where('owner_id', user.id)

// Search
if (search) {
  query = query.where('original_name', 'ILIKE', `%${search}%`)
}

// Type filtering
if (type && type !== 'all') {
  // Map type to MIME type patterns
}

// Sorting
const sortColumn = sortBy || 'created_at'
const sortDirection = sortOrder === 'desc' ? 'desc' : 'asc'
query = query.orderBy(sortColumn, sortDirection)
```

### Database Indexes
```sql
CREATE INDEX idx_files_original_name ON files(original_name);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_created_at ON files(created_at);
CREATE INDEX idx_files_owner_id ON files(owner_id);
```

### Security Considerations
- Search only within user's own files
- No content search on encrypted files (privacy)
- Rate limiting on search endpoints
- Input sanitization for search terms

## Timeline
- **Basic Search**: 2-3 days
- **Advanced Filtering**: 2-3 days  
- **Performance Optimization**: 1-2 days
- **Testing**: 2-3 days

## Success Metrics
- Search response time < 500ms
- Accurate results for name searches
- Proper filtering and sorting
- User satisfaction with search experience