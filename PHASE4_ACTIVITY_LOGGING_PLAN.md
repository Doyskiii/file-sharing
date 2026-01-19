# Phase 4: Activity Logging Implementation Plan

**Date:** January 9, 2026  
**Status:** 🚧 In Progress

---

## 🎯 Objectives

Implement comprehensive activity logging system to track all user actions for:
- Security auditing
- User behavior analysis
- Compliance requirements
- Debugging and troubleshooting

---

## 📋 Current State

### Existing Resources:
- ✅ Activity model exists (`backend/app/models/activity.ts`)
- ✅ Activities table migration exists
- ✅ Basic activity types defined: `upload`, `download`, `share`, `delete`, `update`, `login`

### What's Missing:
- ❌ Activity logging service/helper
- ❌ Integration with existing controllers
- ❌ Activity viewing endpoints
- ❌ Activity filtering and search
- ❌ Activity statistics

---

## 🏗️ Implementation Plan

### Step 1: Enhance Activity Model ✅
**File:** `backend/app/models/activity.ts`

**Changes:**
- Add more activity types (folder operations, share operations, etc.)
- Add metadata field for additional context
- Add foreignKey configurations

**New Activity Types:**
```typescript
export type ActivityAction = 
  // Auth
  | 'login' | 'logout' | 'register'
  // Files
  | 'file:upload' | 'file:download' | 'file:update' | 'file:delete' | 'file:view'
  // Folders
  | 'folder:create' | 'folder:update' | 'folder:delete' | 'folder:view'
  // Sharing
  | 'share:create' | 'share:update' | 'share:delete' | 'share:access'
  // Users
  | 'user:create' | 'user:update' | 'user:delete'
  // Roles
  | 'role:assign' | 'role:revoke'
```

---

### Step 2: Create Activity Service
**File:** `backend/app/services/activity_service.ts`

**Purpose:** Centralized service for logging activities

**Methods:**
```typescript
class ActivityService {
  // Log any activity
  static async log(params: {
    userId: number
    action: ActivityAction
    fileId?: number
    folderId?: number
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }): Promise<Activity>

  // Convenience methods
  static async logFileUpload(userId, fileId, metadata)
  static async logFileDownload(userId, fileId, metadata)
  static async logShare(userId, fileId, shareType, metadata)
  static async logLogin(userId, ipAddress, userAgent)
  // ... etc
}
```

---

### Step 3: Create Activity Controller
**File:** `backend/app/controllers/activity_controller.ts`

**Endpoints:**
1. `GET /activities` - List all activities (admin only)
2. `GET /activities/me` - List current user's activities
3. `GET /activities/file/:id` - List activities for specific file
4. `GET /activities/user/:id` - List activities for specific user (admin only)
5. `GET /activities/stats` - Get activity statistics (admin only)

**Features:**
- Pagination
- Filtering by action type
- Date range filtering
- Search by user/file
- Export to CSV

---

### Step 4: Integrate with Existing Controllers

**Files to Update:**
1. `backend/app/controllers/auth_controller.ts`
   - Log login/logout/register

2. `backend/app/controllers/file_controller.ts`
   - Log upload/download/update/delete/view

3. `backend/app/controllers/folder_controller.ts`
   - Log create/update/delete/view

4. `backend/app/controllers/file_share_controller.ts`
   - Log share creation/update/deletion/access

5. `backend/app/controllers/user_controller.ts`
   - Log user CRUD operations

6. `backend/app/controllers/role_controller.ts`
   - Log role assignments

---

### Step 5: Create Validators
**Files:**
- `backend/app/validators/activity_filter.ts` - For filtering activities

---

### Step 6: Update Routes
**File:** `backend/start/routes.ts`

**New Routes:**
```typescript
// Activity routes (authenticated)
router.group(() => {
  router.get('/activities/me', [ActivityController, 'myActivities'])
  router.get('/activities/file/:id', [ActivityController, 'fileActivities'])
  
  // Admin only
  router.get('/activities', [ActivityController, 'index'])
    .use(middleware.permission('activity:view'))
  router.get('/activities/user/:id', [ActivityController, 'userActivities'])
    .use(middleware.permission('activity:view'))
  router.get('/activities/stats', [ActivityController, 'statistics'])
    .use(middleware.permission('activity:view'))
}).use(middleware.auth())
```

---

### Step 7: Update Migration (if needed)
**File:** `backend/database/migrations/*_create_activities_table.ts`

**Check if we need:**
- metadata column (JSON)
- folderId column
- Additional indexes

---

## 🧪 Testing Plan

### Unit Tests:
1. ActivityService.log() creates activity correctly
2. ActivityService convenience methods work
3. Activity filtering works
4. Activity statistics calculation

### Integration Tests:
1. File upload logs activity
2. File download logs activity
3. Share creation logs activity
4. Login logs activity
5. Activity endpoints return correct data
6. Activity filtering works end-to-end
7. Permission checks work (admin vs regular user)

### Manual Tests:
1. Perform various actions and verify logs
2. Check activity list endpoints
3. Test filtering and search
4. Verify statistics accuracy
5. Test export functionality

---

## 📊 Success Criteria

- ✅ All major actions are logged
- ✅ Activity logs include relevant metadata
- ✅ Users can view their own activities
- ✅ Admins can view all activities
- ✅ Activity filtering works correctly
- ✅ Statistics are accurate
- ✅ Performance impact is minimal
- ✅ All tests pass

---

## 🔒 Security Considerations

1. **Privacy:** Users should only see their own activities (unless admin)
2. **Sensitive Data:** Don't log passwords or tokens
3. **Data Retention:** Consider implementing log rotation/cleanup
4. **Performance:** Use database indexes for efficient queries
5. **Authorization:** Proper permission checks on admin endpoints

---

## 📈 Performance Considerations

1. **Async Logging:** Log activities asynchronously to not block requests
2. **Batch Inserts:** Consider batching for high-volume operations
3. **Indexes:** Add indexes on userId, fileId, action, createdAt
4. **Archiving:** Archive old logs to separate table
5. **Caching:** Cache statistics for dashboard

---

## 🎯 Future Enhancements

1. **Real-time Activity Feed:** WebSocket for live updates
2. **Activity Notifications:** Notify users of important activities
3. **Advanced Analytics:** Charts and graphs
4. **Anomaly Detection:** Detect suspicious activities
5. **Export Options:** PDF, Excel, JSON
6. **Activity Replay:** Reconstruct user sessions

---

## 📝 Implementation Order

1. ✅ Review existing Activity model
2. ⏳ Enhance Activity model with new types
3. ⏳ Create ActivityService
4. ⏳ Create ActivityController
5. ⏳ Integrate with AuthController (login/logout)
6. ⏳ Integrate with FileController
7. ⏳ Integrate with FolderController
8. ⏳ Integrate with FileShareController
9. ⏳ Create validators
10. ⏳ Update routes
11. ⏳ Test all integrations
12. ⏳ Create documentation

---

**Status:** Ready to implement  
**Estimated Time:** 2-3 hours  
**Priority:** High (Security & Compliance)
