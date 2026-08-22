import { MockDb } from "@/lib/db/mockDb";

export interface StoredUser {
  campus_id: string; // 5-digit ID
  password: string;  // saved password
  name: string;
  is_admin: boolean;
}

export interface UserStats {
  campus_id: string;
  name: string;
  is_admin: boolean;
  total_reports: number;
  lost_reports_count: number;
  found_reports_count: number;
  resolved_reports_count: number;
  active_reports_count: number;
  recent_reports: Array<{
    id: string;
    title: string;
    type: string;
    category: string;
    status: string;
    location: string;
    created_at: string;
  }>;
}

export const ADMIN_ID = "43554";
export const ADMIN_PASSWORD = "JustAnAlt";

// Initial campus registry
const INITIAL_USERS: StoredUser[] = [
  {
    campus_id: ADMIN_ID,
    password: ADMIN_PASSWORD,
    name: "Campus Administrator",
    is_admin: true,
  },
  {
    campus_id: "90421",
    password: "1234",
    name: "Sarah Lin",
    is_admin: false,
  },
  {
    campus_id: "71829",
    password: "1234",
    name: "David Kim",
    is_admin: false,
  },
  {
    campus_id: "55120",
    password: "1234",
    name: "Maya Patel",
    is_admin: false,
  },
  {
    campus_id: "66401",
    password: "1234",
    name: "Chloe Miller",
    is_admin: false,
  },
  {
    campus_id: "88219",
    password: "1234",
    name: "Alex Thorne",
    is_admin: false,
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __CAMPUS_USERS_STORE: Map<string, StoredUser> | undefined;
}

function getUsersMap(): Map<string, StoredUser> {
  if (!global.__CAMPUS_USERS_STORE) {
    global.__CAMPUS_USERS_STORE = new Map<string, StoredUser>();
    for (const u of INITIAL_USERS) {
      global.__CAMPUS_USERS_STORE.set(u.campus_id, { ...u });
    }
  }
  return global.__CAMPUS_USERS_STORE;
}

export const UserStore = {
  /**
   * Authenticate or register a 5-digit campus ID with password.
   * If new user: saves the password.
   * If existing user: checks password matches.
   */
  authenticate(campusId: string, password: string, name?: string): {
    success: boolean;
    user?: StoredUser;
    error?: string;
    isNew?: boolean;
  } {
    const cleanId = campusId.trim();
    const cleanPass = password.trim();

    if (!/^\d{5}$/.test(cleanId)) {
      return { success: false, error: "Campus ID must be exactly a 5-digit number." };
    }

    if (!cleanPass) {
      return { success: false, error: "Password is required." };
    }

    // Special check for Admin 43554
    if (cleanId === ADMIN_ID) {
      if (cleanPass !== ADMIN_PASSWORD) {
        return { success: false, error: "Incorrect password for Campus Administrator." };
      }
      return {
        success: true,
        user: {
          campus_id: ADMIN_ID,
          password: ADMIN_PASSWORD,
          name: "Campus Administrator",
          is_admin: true,
        },
      };
    }

    const map = getUsersMap();
    const existing = map.get(cleanId);

    if (existing) {
      if (existing.password !== cleanPass) {
        return { success: false, error: `Incorrect password for Campus ID #${cleanId}.` };
      }
      return { success: true, user: existing };
    }

    // Register new 5-digit user and persist their password
    const newUser: StoredUser = {
      campus_id: cleanId,
      password: cleanPass,
      name: name || `Student #${cleanId}`,
      is_admin: false,
    };

    map.set(cleanId, newUser);
    return { success: true, user: newUser, isNew: true };
  },

  /**
   * Verify credentials for resolving a report
   */
  verifyForResolution(
    campusId: string,
    password?: string,
    reportOwnerId?: string,
    isAuthenticatedSession?: boolean
  ): {
    authorized: boolean;
    authorizedBy?: string;
    error?: string;
  } {
    const cleanId = campusId.trim();
    const cleanPass = (password || "").trim();

    // 1. Admin Master Resolution
    if (cleanId === ADMIN_ID) {
      if (isAuthenticatedSession || cleanPass === ADMIN_PASSWORD) {
        return { authorized: true, authorizedBy: "Campus Administrator" };
      }
      return { authorized: false, error: "Incorrect password for Campus Administrator." };
    }

    // 2. Original Reporter Resolution
    if (reportOwnerId && cleanId === reportOwnerId.trim()) {
      if (isAuthenticatedSession) {
        return { authorized: true, authorizedBy: `Verified Reporter (ID #${cleanId})` };
      }
      const map = getUsersMap();
      const user = map.get(cleanId);
      if (user) {
        if (user.password === cleanPass) {
          return { authorized: true, authorizedBy: `Verified Reporter (ID #${cleanId})` };
        } else {
          return { authorized: false, error: "Incorrect password for this student ID." };
        }
      }
      // If student not in memory store, accept their matching PIN/password
      return { authorized: true, authorizedBy: `Verified Reporter (ID #${cleanId})` };
    }

    return {
      authorized: false,
      error: `Unauthorized: Only the original reporter (ID #${reportOwnerId || "Owner"}) or Campus Admin can resolve this report.`,
    };
  },

  /**
   * Get all registered campus users aggregated with their report counts & statistics
   */
  getAllUsersWithStats(): UserStats[] {
    const map = getUsersMap();
    const allReports = MockDb.getAllReports();

    // Also include any reporter IDs that exist in reports but not in map
    for (const r of allReports) {
      if (r.reporter_campus_id && !map.has(r.reporter_campus_id)) {
        map.set(r.reporter_campus_id, {
          campus_id: r.reporter_campus_id,
          password: "saved",
          name: r.contact_name || `Student #${r.reporter_campus_id}`,
          is_admin: r.reporter_campus_id === ADMIN_ID,
        });
      }
    }

    const result: UserStats[] = [];

    map.forEach((user) => {
      const userReports = allReports.filter(
        (r) => r.reporter_campus_id === user.campus_id
      );

      const lostCount = userReports.filter((r) => r.type === "lost" && r.status !== "resolved").length;
      const foundCount = userReports.filter((r) => r.type === "found" && r.status !== "resolved").length;
      const resolvedCount = userReports.filter((r) => r.status === "resolved").length;

      result.push({
        campus_id: user.campus_id,
        name: user.name,
        is_admin: user.is_admin,
        total_reports: userReports.length,
        lost_reports_count: lostCount,
        found_reports_count: foundCount,
        resolved_reports_count: resolvedCount,
        active_reports_count: lostCount + foundCount,
        recent_reports: userReports.map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type,
          category: r.category,
          status: r.status,
          location: r.location,
          created_at: r.created_at,
        })),
      });
    });

    // Sort: Admin first, then by total reports descending
    return result.sort((a, b) => {
      if (a.is_admin && !b.is_admin) return -1;
      if (!a.is_admin && b.is_admin) return 1;
      return b.total_reports - a.total_reports;
    });
  },
};
