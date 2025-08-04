import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  StudySet,
  StudySession,
  UserProgress,
  Notification,
  COLLECTIONS,
} from "@/lib/database-types";

export class DatabaseService {
  // ============ STUDY SETS ============

  static async createStudySet(
    studySet: Omit<StudySet, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.STUDY_SETS), {
        ...studySet,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating study set:", error);
      throw error;
    }
  }

  static async getStudySet(studySetId: string): Promise<StudySet | null> {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.STUDY_SETS, studySetId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StudySet;
      }
      return null;
    } catch (error) {
      console.error("Error getting study set:", error);
      throw error;
    }
  }

  static async getUserStudySets(userId: string): Promise<StudySet[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.STUDY_SETS),
        where("userId", "==", userId),
        orderBy("lastAccessedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StudySet[];
    } catch (error) {
      console.error("Error getting user study sets:", error);
      throw error;
    }
  }

  static async updateStudySet(
    studySetId: string,
    updates: Partial<StudySet>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.STUDY_SETS, studySetId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating study set:", error);
      throw error;
    }
  }

  static async deleteStudySet(studySetId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.STUDY_SETS, studySetId));
    } catch (error) {
      console.error("Error deleting study set:", error);
      throw error;
    }
  }

  static async updateLastAccessed(studySetId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.STUDY_SETS, studySetId), {
        lastAccessedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating last accessed:", error);
      throw error;
    }
  }

  // ============ STUDY SESSIONS ============

  static async createStudySession(
    session: Omit<StudySession, "id">
  ): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(db, COLLECTIONS.STUDY_SESSIONS),
        session
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating study session:", error);
      throw error;
    }
  }

  static async updateStudySession(
    sessionId: string,
    updates: Partial<StudySession>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.STUDY_SESSIONS, sessionId), updates);
    } catch (error) {
      console.error("Error updating study session:", error);
      throw error;
    }
  }

  static async getUserStudySessions(
    userId: string,
    studySetId?: string
  ): Promise<StudySession[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.STUDY_SESSIONS),
        where("userId", "==", userId),
        orderBy("startTime", "desc")
      );

      if (studySetId) {
        q = query(q, where("studySetId", "==", studySetId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StudySession[];
    } catch (error) {
      console.error("Error getting user study sessions:", error);
      throw error;
    }
  }

  // ============ USER PROGRESS ============

  static async getUserProgress(
    userId: string,
    studySetId: string
  ): Promise<UserProgress | null> {
    try {
      const progressId = `${userId}_${studySetId}`;
      const docSnap = await getDoc(
        doc(db, COLLECTIONS.USER_PROGRESS, progressId)
      );

      if (docSnap.exists()) {
        return docSnap.data() as UserProgress;
      }
      return null;
    } catch (error) {
      console.error("Error getting user progress:", error);
      throw error;
    }
  }

  static async updateUserProgress(
    userId: string,
    studySetId: string,
    progress: Partial<UserProgress>
  ): Promise<void> {
    try {
      const progressId = `${userId}_${studySetId}`;
      const progressRef = doc(db, COLLECTIONS.USER_PROGRESS, progressId);

      const existingProgress = await this.getUserProgress(userId, studySetId);

      if (existingProgress) {
        await updateDoc(progressRef, {
          ...progress,
          lastUpdated: new Date(),
        });
      } else {
        const newProgress: UserProgress = {
          userId,
          studySetId,
          totalTimeSpent: 0,
          sessionsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          quizStats: {
            totalQuizzes: 0,
            averageScore: 0,
            bestScore: 0,
            totalCorrectAnswers: 0,
            totalQuestions: 0,
          },
          flashcardStats: {
            totalFlashcards: 0,
            masteredFlashcards: 0,
            averageRetentionRate: 0,
          },
          achievements: [],
          lastUpdated: new Date(),
          ...progress,
        };

        await updateDoc(progressRef, newProgress as any);
      }
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw error;
    }
  }

  // ============ NOTIFICATIONS ============

  static async createNotification(
    notification: Omit<Notification, "id">
  ): Promise<string> {
    try {
      const docRef = await addDoc(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        notification
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async getUserNotifications(
    userId: string,
    unreadOnly = false
  ): Promise<Notification[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      if (unreadOnly) {
        q = query(q, where("read", "==", false));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // ============ ANALYTICS ============

  static async getStudySetAnalytics(studySetId: string): Promise<any> {
    try {
      const sessions = await getDocs(
        query(
          collection(db, COLLECTIONS.STUDY_SESSIONS),
          where("studySetId", "==", studySetId),
          orderBy("startTime", "desc")
        )
      );

      const sessionData = sessions.docs.map(
        (doc) => doc.data() as StudySession
      );

      return {
        totalSessions: sessionData.length,
        totalTimeSpent: sessionData.reduce(
          (acc, session) => acc + session.duration,
          0
        ),
        averageSessionDuration:
          sessionData.length > 0
            ? sessionData.reduce((acc, session) => acc + session.duration, 0) /
              sessionData.length
            : 0,
        quizSessions: sessionData.filter((s) => s.type === "quiz").length,
        flashcardSessions: sessionData.filter((s) => s.type === "flashcards")
          .length,
        chatSessions: sessionData.filter((s) => s.type === "chat").length,
        recentActivity: sessionData.slice(0, 10),
      };
    } catch (error) {
      console.error("Error getting study set analytics:", error);
      throw error;
    }
  }

  // ============ SEARCH ============

  static async searchStudySets(
    userId: string,
    searchTerm: string
  ): Promise<StudySet[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia or similar for production
      const q = query(
        collection(db, COLLECTIONS.STUDY_SETS),
        where("userId", "==", userId),
        orderBy("title")
      );

      const querySnapshot = await getDocs(q);
      const allSets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StudySet[];

      // Client-side filtering (not ideal for large datasets)
      return allSets.filter(
        (set) =>
          set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          set.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          set.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    } catch (error) {
      console.error("Error searching study sets:", error);
      throw error;
    }
  }
}
