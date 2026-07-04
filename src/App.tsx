import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import {
  auth,
  db,
  handleFirestoreError,
  logOut,
  OperationType,
} from "./firebase";
import ChatInterface, { ChatInboxList } from "./components/ChatInterface";
import ItemDetail from "./components/ItemDetail";
import { Item, Claim } from "./types";
import {
  ShieldCheck,
  Search,
  Lock,
  UserPlus,
  ArrowRight,
  Tag,
  Lightbulb,
  Key,
  Smartphone,
  Home,
  Package,
  Bell,
  User as UserIcon,
  MapPin,
  CheckCircle2,
  Info,
  Navigation,
  Hand,
  Inbox,
  PenTool,
  Camera,
  MessageCircle,
  Mail,
  Eye,
  EyeOff,
  Dices,
  Save,
  LogOut,
  Send,
  Zap,
  CheckSquare,
  X,
  ShoppingBag,
  MapIcon,
  Users,
  FileSearch,
  MessageSquareHeart,
  PackageCheck,
  PlusCircle,
  Quote,
  Handshake,
  Filter,
  Clock,
  Menu, Grid,
  Archive, Pin, Shapes, BarChart2, HeartHandshake, HelpCircle,
  ArrowLeft, Share, Bot, RefreshCw, BadgeCheck, MessageSquare, Gavel, Shield , Scan , Settings , AlertTriangle, Star, Heart, TrendingUp, ArrowDownUp, FileText, Image as ImageIcon } from "lucide-react"
import { uploadToCloudinary } from "./lib/cloudinary";

interface ItemReport {
  id: string;
  userId: string;
  title: string;
  location: string;
  desc?: string;
  description?: string;
  type: "lost" | "found";
  image?: string;
  imageUrl?: string;
  createdAt: any;
  claimed: boolean;
}

const ONBOARD_STEPS = [
  {
    icon: <Search className="text-white h-12 w-12" />,
    label: "Step 1 of 4",
    title: "Welcome to FindTrack!",
    desc: "Your lost & found platform. Report missing items, search for found ones, and get reunited with your belongings — fast.",
  },
  {
    icon: <Package className="text-white h-12 w-12" />,
    label: "Step 2 of 4",
    title: "Report Lost or Found Items",
    desc: "Tap the Report tab to submit an item. Add a photo, title, and location for the best chance of recovery. The more detail, the better!",
  },
  {
    icon: <CheckCircle2 className="text-white h-12 w-12" />,
    label: "Step 3 of 4",
    title: "Smart Match Suggestions",
    desc: "Our smart system automatically compares your reports against others and highlights possible matches — so you can claim your item faster.",
  },
  {
    icon: <MapPin className="text-white h-12 w-12" />,
    label: "Step 4 of 4",
    title: "Pin & Track Items",
    desc: "Bookmark items you're watching with the pin button. Check Pinned Items in the menu for quick access anytime. You're all set — good luck!",
  },
];

export default function App() {
  // Navigation layout state: 'landing' | 'login' | 'signup' | 'dashboard' | 'verify-email' | 'privacy' | 'terms'
  const [currentView, setCurrentView] = useState<
    | "landing"
    | "login"
    | "signup"
    | "dashboard"
    | "verify-email"
    | "privacy"
    | "terms"
  >(() => {
    const path = window.location.pathname;
    if (path === "/privacy") return "privacy";
    if (path === "/terms") return "terms";
    return "landing";
  });

  // Dashboard panel selector
  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Authentication & session state
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Form input validations / fields
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPass] = useState("");
  const [signupFirst, setSignupFirst] = useState("");
  const [signupLast, setSignupLast] = useState("");
  const [signupContact, setSignupContact] = useState("");

  // App alerts, loading states & real-time sync list
  const [items, setItems] = useState<ItemReport[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [toasts, setToasts] = useState<
    { id: string; msg: string; type: "success" | "error" }[]
  >([]);
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showRefererModal, setShowRefererModal] = useState(false);
  const [refererBlockedDomain, setRefererBlockedDomain] = useState("");

  // Dashboard inputs
  const [reportStep, setReportStep] = useState(1);
  const [reportTitle, setReportTitle] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [reportImage, setReportImage] = useState<string>("");
  const [reportImageFile, setReportImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reportSecurityQuestion, setReportSecurityQuestion] = useState("");
  const [reportSecurityAnswer, setReportSecurityAnswer] = useState("");
  const [incomingClaims, setIncomingClaims] = useState<Claim[]>([]);

  // Dashboard Search state
  const [sQuery, setSQuery] = useState("");
  const [sFilter, setSFilter] = useState("all");
  const [sLoc, setSLoc] = useState("");
  const [sDate, setSDate] = useState("");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Category browse keyword lists
  const [categoryKeywords, setCategoryKeywords] = useState<string[] | null>(
    null,
  );

  // Profile data
  const [profileName, setProfileName] = useState("Student");
  const [profileLocation, setProfileLocation] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const markAlertRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAlertsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const [profileEmail, setProfileEmail] = useState("");
  const [profileContact, setProfileContact] = useState("");
  const [profileAvatar, setProfileAvatar] = useState(
    "https://api.dicebear.com/8.x/avataaars/svg?seed=default",
  );

  // Pinned item list IDs (local storage synchronization)
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Shimmer skeleton state
  const [homeShimmer, setHomeShimmer] = useState(true);

  // Donut chart canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Trigger custom toast notification
  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3300);
  };

  const handleBackToSafety = () => {
    if (auth.currentUser) {
      if (auth.currentUser.email && !auth.currentUser.emailVerified) {
        setCurrentView("verify-email");
        window.history.pushState(null, "", "/verify-email");
      } else {
        setCurrentView("dashboard");
        window.history.pushState(null, "", "/");
      }
    } else {
      try {
        const guestSession = localStorage.getItem("sessionUser");
        if (guestSession) {
          const session = JSON.parse(guestSession);
          if (session && session.email === "") {
            setCurrentView("dashboard");
            window.history.pushState(null, "", "/");
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
      setCurrentView("landing");
      window.history.pushState(null, "", "/");
    }
  };

  // Check login session
  const isLoggedIn = useMemo(() => {
    return user !== null;
  }, [user]);

  // 1. Listen to Authentication State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);

      if (currentUser) {
        // Automatically sync initial profile credentials
        setProfileEmail(currentUser.email || "");

        // Sync profile data from localStorage context if exists
        try {
          const lProfile = localStorage.getItem("userProfile");
          if (lProfile) {
            const parsed = JSON.parse(lProfile);
            if (parsed.name && parsed.name !== "Guest") {
              setProfileName(parsed.name);
            } else {
              setProfileName(
                currentUser.displayName ||
                  currentUser.email?.split("@")[0] ||
                  "User",
              );
            }
            if (parsed.contact) setProfileContact(parsed.contact);
            if (parsed.avatar && !parsed.avatar.includes("guest")) {
              setProfileAvatar(parsed.avatar);
            }
          } else {
            setProfileName(
              currentUser.displayName ||
                currentUser.email?.split("@")[0] ||
                "User",
            );
          }
        } catch (e) {
          console.error(e);
        }

        // Block unverified email users from accessing protected views (dashboard)
        const path = window.location.pathname;
        if (["/privacy", "/terms", "/about", "/safety", "/help", "/contact"].includes(path)) {
          setCurrentView(path.slice(1) as any);
        } else if (currentUser.email && !currentUser.emailVerified) {
          setCurrentView("verify-email");
        } else {
          // Force token refresh on load to prevent stale email_verified claims from breaking rules
          if (currentUser.emailVerified) {
            currentUser.getIdToken(true).catch(console.error);
          }
          // Switch view to dashboard on successful load
          setCurrentView("dashboard");
        }
      } else {
        // If guest is currently in session, direct to dashboard
        try {
          const guestSession = localStorage.getItem("sessionUser");
          if (guestSession) {
            const session = JSON.parse(guestSession);
            if (session && session.email === "") {
              setProfileName("Guest");
              setProfileEmail("");
              const path = window.location.pathname;
              if (["/privacy", "/terms", "/about", "/safety", "/help", "/contact"].includes(path)) {
                setCurrentView(path.slice(1) as any);
              } else {
                setCurrentView("dashboard");
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    });

    // Sync Pinned Items
    try {
      const pins = localStorage.getItem("pinnedItems");
      if (pins) {
        setPinnedIds(JSON.parse(pins));
      }
    } catch (e) {
      console.error(e);
    }

    return unsubscribe;
  }, []);

  // Handle browser back/forward buttons (routing sync)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/privacy") {
        setCurrentView("privacy");
      } else if (path === "/terms") {
        setCurrentView("terms");
      } else if (path === "/login") {
        setCurrentView("login");
      } else if (path === "/signup") {
        setCurrentView("signup");
      } else if (path === "/" || path === "") {
        if (auth.currentUser) {
          if (auth.currentUser.email && !auth.currentUser.emailVerified) {
            setCurrentView("verify-email");
          } else {
            setCurrentView("dashboard");
          }
        } else {
          setCurrentView("landing");
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user]);

  // 1.5. Automatic email verification polling when on verify-email view
  useEffect(() => {
    if (currentView !== "verify-email") return;

    const interval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            await auth.currentUser.getIdToken(true);
            triggerToast("✅ Email verified automatically!", "success");
            setCurrentView("dashboard");
          }
        }
      } catch (e) {
        console.error("Auto verification check failed:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentView, user]);

  // 2. Real-time Firestore Sync of items / reports
  useEffect(() => {
    const reportsCollection = collection(db, "items"); // Rules define items matching

    // Listen to all public lost/found entries across the board to permit comprehensive lost and found search engine matching
    const unsubscribe = onSnapshot(
      query(reportsCollection),
      (snapshot) => {
        const list: ItemReport[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ItemReport);
        });
        // Sort in-memory descending creation date
        list.sort((a, b) => {
          const aTime = a.createdAt?.seconds
            ? a.createdAt.seconds * 1000
            : new Date(a.createdAt || 0).getTime();
          const bTime = b.createdAt?.seconds
            ? b.createdAt.seconds * 1000
            : new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        setItems(list);
        setHomeShimmer(false);
      },
      (error) => {
        console.error("Firestore sync error:", error);
      },
    );

    return unsubscribe;
  }, []);

  // 2.2. Real-time Claims Sync for Finder Review Panel
  useEffect(() => {
    if (!user?.uid) {
      setIncomingClaims([]);
      return;
    }
    const claimsCollection = collection(db, "claims");
    const q = query(claimsCollection, where("finderId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Claim[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Claim);
        });
        // Place pending claims at the top, then sort by newest first
        list.sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
          const aTime = a.createdAt?.seconds
            ? a.createdAt.seconds * 1000
            : new Date(a.createdAt || 0).getTime();
          const bTime = b.createdAt?.seconds
            ? b.createdAt.seconds * 1000
            : new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        setIncomingClaims(list);
      },
      (error) => {
        console.error("Claims snapshot read failed:", error);
      },
    );

    return unsubscribe;
  }, [user]);

  // Safeguard: Block unverified users from accessing protected views (dashboard) and redirect them to verify screen
  useEffect(() => {
    if (
      auth.currentUser &&
      auth.currentUser.email &&
      !auth.currentUser.emailVerified &&
      currentView === "dashboard"
    ) {
      setCurrentView("verify-email");
    }
  }, [currentView, user]);

  // 3. Initiate Onboarding trigger
  useEffect(() => {
    if (currentView === "dashboard") {
      const isComplete = localStorage.getItem("ft_onboarded");
      if (!isComplete) {
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1100);
        return () => clearTimeout(timer);
      }
    }
  }, [currentView]);

  // Handle Firebase Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingAuth) return;
    if (!authEmail || !authPassword) {
      triggerToast("❌ Please enter your email and password.", "error");
      return;
    }

    setLoadingAuth(true);
    try {
      const credentials = await signInWithEmailAndPassword(
        auth,
        authEmail.trim(),
        authPassword,
      );
      localStorage.setItem(
        "sessionUser",
        JSON.stringify({
          id: credentials.user.uid,
          email: credentials.user.email,
        }),
      );
      triggerToast("✅ Login successful! Redirecting...", "success");
      setAuthEmail("");
      setAuthPass("");
      if (credentials.user.email && !credentials.user.emailVerified) {
        setCurrentView("verify-email");
      } else {
        setCurrentView("dashboard");
      }
    } catch (err: any) {
      console.error("SignIn error:", err);
      if (
        err.message?.includes("requests-from-referer") ||
        err.code?.includes("requests-from-referer")
      ) {
        setRefererBlockedDomain(window.location.hostname);
        setShowRefererModal(true);
        triggerToast("⚠️ Domain not authorized in Firebase Console.", "error");
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        triggerToast(
          "❌ Invalid email or password. Please try again.",
          "error",
        );
      } else {
        triggerToast(
          "❌ Login failed: " +
            (err.message || err.code || "Please try again."),
          "error",
        );
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  // Handle Firebase Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingAuth) return;
    if (!signupFirst.trim() || !signupLast.trim()) {
      triggerToast("❌ First and Last names are required.", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authEmail.trim())) {
      triggerToast("❌ Please enter a valid email address.", "error");
      return;
    }
    if (authPassword.length < 6) {
      triggerToast("❌ Password must be at least 6 characters.", "error");
      return;
    }

    setLoadingAuth(true);
    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        authEmail.trim().toLowerCase(),
        authPassword,
      );
      const fullName = `${signupFirst.trim()} ${signupLast.trim()}`;

      localStorage.setItem(
        "sessionUser",
        JSON.stringify({
          id: credentials.user.uid,
          name: fullName,
          email: authEmail.trim().toLowerCase(),
        }),
      );

      const prof = {
        name: fullName,
        email: authEmail.trim().toLowerCase(),
        contact: signupContact.trim(),
        avatar: profileAvatar,
      };
      localStorage.setItem("userProfile", JSON.stringify(prof));

      setProfileName(fullName);
      setProfileContact(signupContact);
      setProfileEmail(authEmail.trim().toLowerCase());

      // Automatically send a verification email using Firebase sendEmailVerification()
      try {
        const actionCodeSettings = {
          url: window.location.origin,
          handleCodeInApp: false,
        };
        await sendEmailVerification(credentials.user, actionCodeSettings);
        triggerToast(
          "✅ Account created! Please check your email to verify.",
          "success",
        );
      } catch (err: any) {
        console.error("Verification email sending failed:", err);
        triggerToast(
          "❌ Account created, but email verification failed to send. Try resending.",
          "error",
        );
      }

      setSignupFirst("");
      setSignupLast("");
      setSignupContact("");
      setAuthEmail("");
      setAuthPass("");
      setCurrentView("verify-email");
    } catch (err: any) {
      console.error("SignUp error:", err);
      if (err.code === "auth/email-already-in-use") {
        triggerToast("❌ Email already registered.", "error");
      } else if (
        err.message?.includes("requests-from-referer") ||
        err.code?.includes("requests-from-referer")
      ) {
        setRefererBlockedDomain(window.location.hostname);
        setShowRefererModal(true);
        triggerToast("⚠️ Domain not authorized in Firebase Console.", "error");
      } else {
        triggerToast(
          "❌ Signup failed: " + (err.message || err.code || "Try again."),
          "error",
        );
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  // Handle Logout
  const handleLogoutAction = async () => {
    localStorage.removeItem("sessionUser");
    // Keeping userProfile locally since we do not currently sync names/avatars to a users collection.
    try {
      await logOut();
    } catch (er) {}
    setProfileName("Student");
    setProfileEmail("");
    setProfileContact("");
    triggerToast("🚪 Logged out securely.", "success");
    setCurrentView("landing");
    setActiveTab("home");
  };

  // Browse as guest fallback trigger
  const handleGuestBrowse = () => {
    localStorage.removeItem("sessionUser");
    const guestUser = {
      name: "Guest",
      email: "",
      contact: "",
      avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=guest",
    };
    localStorage.setItem("userProfile", JSON.stringify(guestUser));
    localStorage.setItem(
      "sessionUser",
      JSON.stringify({ id: "guest_" + Date.now(), email: "" }),
    );
    setProfileName("Guest");
    setProfileEmail("");
    setProfileContact("");
    setProfileAvatar(guestUser.avatar);
    setCurrentView("dashboard");
    setActiveTab("home");
  };

  // Save profile modifications
  const handleSaveProfile = () => {
    if (profileName === "Guest") {
      setShowGuestModal(true);
      return;
    }

    const updated = {
      name: profileName,
      email: profileEmail,
      contact: profileContact,
      avatar: profileAvatar,
    };
    localStorage.setItem("userProfile", JSON.stringify(updated));
    triggerToast("✅ Profile saved successfully!", "success");
  };

  // Image upload reading state
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReportImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setReportImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Profile avatar trigger random
  const handleRandomAvatar = () => {
    if (profileName === "Guest") {
      setShowGuestModal(true);
      return;
    }
    const seed = Math.random().toString(36).slice(2, 8);
    const styles = ["avataaars", "bottts", "fun-emoji", "lorelei", "pixel-art"];
    const style = styles[Math.floor(Math.random() * styles.length)];
    setProfileAvatar(`https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`);
  };

  // Submit Report to Firestore
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName === "Guest") {
      setShowGuestModal(true);
      return;
    }

    if (!reportTitle.trim()) {
      triggerToast("❌ Item title is required.", "error");
      return;
    }

    setIsUploading(true);
    let finalImageUrl = reportImage || "";

    if (reportImageFile) {
      try {
        finalImageUrl = await uploadToCloudinary(reportImageFile);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        triggerToast("❌ Failed to upload image.", "error");
        setIsUploading(false);
        return;
      }
    }

    const payloadId =
      "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    // Firestore Object Schema aligned with security rules constraints
    const reportData = {
      id: payloadId,
      userId: auth.currentUser?.uid || "anonymous_uid",
      title: reportTitle.trim(),
      description: reportDesc.trim() || "No description provided.",
      type: reportType,
      category: "others", // Supported standard selection
      location: reportLocation.trim() || "Unknown Location",
      status: "active",
      contactName: profileName || "Student",
      contactInfo: `${profileContact || "No contact provided"} | Email: ${reportEmail.trim() || profileEmail || "No email provided"}`,
      date: new Date().toISOString(),
      imageUrl: finalImageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      claimed: false,
      securityQuestion: reportSecurityQuestion.trim(),
      securityAnswer: reportSecurityAnswer.trim().toLowerCase(),
    };

    try {
      await setDoc(doc(db, "items", payloadId), reportData);
      triggerToast("✅ Report submitted successfully!", "success");

      // Reset form variables
      setReportTitle("");
      setReportLocation("");
      setReportDesc("");
      setReportEmail("");
      setReportType("lost");
      setReportImage("");
      setReportImageFile(null);
      setReportSecurityQuestion("");
      setReportSecurityAnswer("");

      // Auto redirect to home feed out of form
      setActiveTab("home");
    } catch (err) {
      console.error("Firestore creation error:", err);
      triggerToast("❌ Submission rejected by security parameters.", "error");
      try {
        handleFirestoreError(err, OperationType.CREATE, `items/${payloadId}`);
      } catch (e) {}
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle Pin Bookmark action
  const togglePin = (itemId: string) => {
    if (profileName === "Guest") {
      setShowGuestModal(true);
      return;
    }
    let pins = [...pinnedIds];
    const idx = pins.indexOf(itemId);
    if (idx > -1) {
      pins.splice(idx, 1);
      triggerToast("📍 Item unpinned", "success");
    } else {
      pins.push(itemId);
      triggerToast("📌 Item pinned!", "success");
    }
    setPinnedIds(pins);
    localStorage.setItem("pinnedItems", JSON.stringify(pins));
  };

  // Flag Item as Claimed
  const claimItem = async (itemId: string) => {
    if (profileName === "Guest") {
      setShowGuestModal(true);
      return;
    }
    if (
      !confirm("Are you sure you want to mark this item as claimed/recovered?")
    )
      return;

    try {
      await updateDoc(doc(db, "items", itemId), {
        claimed: true,
        status: "resolved",
        updatedAt: serverTimestamp(),
      });
      triggerToast("✅ Item marked as claimed!", "success");
    } catch (err) {
      console.error(err);
      triggerToast("❌ Action access is denied.", "error");
    }
  };

  // Delete Listing report
  const deleteItem = async (itemId: string) => {
    if (profileName === "Guest") {
      setShowGuestModal(true);
      return;
    }
    if (
      !confirm("Delete this report entry permanently? This cannot be undone.")
    )
      return;

    try {
      await deleteDoc(doc(db, "items", itemId));
      setPinnedIds((prev) => prev.filter((id) => id !== itemId));
      triggerToast("🗑️ Item deleted", "error");
      setActiveTab("search");
    } catch (err) {
      console.error(err);
      triggerToast("❌ Deletion rejected.", "error");
    }
  };

  // Helper actions to approve / reject claims
  
  const handleSubmitClaim = async (itemId: string, finderId: string, securityQuestion: string, providedAnswer: string) => {
    if (!auth.currentUser) return;
    try {
      const claimId = "claim_" + Date.now();
      await setDoc(doc(db, "claims", claimId), {
        itemId,
        finderId,
        claimerId: auth.currentUser.uid,
        securityQuestion,
        providedAnswer,
        status: "pending",
        createdAt: new Date(),
      });
      triggerToast("Claim submitted successfully!", "success");
      setActiveTab("home");
    } catch (error: any) {
      triggerToast("Failed to submit claim", "error");
    }
  };

  const handleApproveClaim = async (claimId: string, itemId: string) => {
    try {
      await updateDoc(doc(db, "claims", claimId), {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      triggerToast(
        "✅ Ownership claim approved! Access credentials unlocked.",
        "success",
      );
    } catch (err) {
      console.error("Error approving claim:", err);
      triggerToast("❌ Action failed or unauthorized.", "error");
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      await updateDoc(doc(db, "claims", claimId), {
        status: "rejected",
        updatedAt: serverTimestamp(),
      });
      triggerToast("❌ Claim response declined.", "error");
    } catch (err) {
      console.error("Error rejecting claim:", err);
      triggerToast("❌ Action failed or unauthorized.", "error");
    }
  };

  // Initiate direct chat about item
  const handleStartChat = async (otherUserUid: string, itemId: string) => {
    if (!user) {
      if (profileName === "Guest") {
        setShowGuestModal(true);
      } else {
        setCurrentView("login");
      }
      return;
    }

    if (user.uid === otherUserUid) {
      triggerToast("💡 This is your own listing!", "success");
      return;
    }

    try {
      // Deterministic chat ID
      const chatId = [user.uid, otherUserUid, itemId].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        const itemRef = doc(db, "items", itemId);
        const itemSnap = await getDoc(itemRef);
        const itemTitle = itemSnap.exists()
          ? itemSnap.data().title
          : "Lost/Found Item";

        await setDoc(chatRef, {
          chatId,
          participants: [user.uid, otherUserUid],
          itemId,
          itemTitle,
          lastMessage: `Convo initiated about "${itemTitle}"`,
          timestamp: serverTimestamp(),
        });
      }

      setActiveChatId(chatId);
    } catch (err) {
      console.error("Error creating chat:", err);
      triggerToast("❌ Failed to initiate chat room.", "error");
    }
  };

  // Active counter statistics dynamic
  const stats = useMemo(() => {
    return {
      lost: items.filter((i) => i.type === "lost" && !i.claimed).length,
      found: items.filter((i) => i.type === "found" && !i.claimed).length,
      claimed: items.filter((i) => i.claimed).length,
    };
  }, [items]);

  // Analytics month and year extractor helper
  const getItemMonthAndYear = (item: ItemReport) => {
    let date: Date | null = null;
    if (item.createdAt) {
      if (typeof item.createdAt.toDate === "function") {
        date = item.createdAt.toDate();
      } else if (typeof item.createdAt.seconds === "number") {
        date = new Date(item.createdAt.seconds * 1000);
      } else {
        date = new Date(item.createdAt);
      }
    }
    
    if (!date || isNaN(date.getTime())) {
      return null;
    }
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
    };
  };

  // Analytics dynamic recovery trends over last 6 months
  const monthlyStats = useMemo(() => {
    const monthsData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsData.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        name: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`,
        reported: 0,
        resolved: 0,
      });
    }

    items.forEach((item) => {
      const mInfo = getItemMonthAndYear(item);
      if (!mInfo) return;

      const bucket = monthsData.find(
        (m) => m.year === mInfo.year && m.month === mInfo.month
      );
      if (bucket) {
        bucket.reported++;
        if (item.claimed) {
          bucket.resolved++;
        }
      }
    });

    return monthsData;
  }, [items]);

  // Max value in monthly trend to scale chart height
  const maxChartValue = useMemo(() => {
    let max = 10;
    monthlyStats.forEach((m) => {
      if (m.reported > max) max = m.reported;
      if (m.resolved > max) max = m.resolved;
    });
    return max;
  }, [monthlyStats]);

  // Dynamic Item Categories based on keywords matching
  const categoryStats = useMemo(() => {
    const counts: { [key: string]: { count: number; color: string } } = {
      "Electronics": { count: 0, color: "#01725a" },
      "Wallets & Bags": { count: 0, color: "#336dbe" },
      "Pets": { count: 0, color: "#fab83f" },
      "Documents & Books": { count: 0, color: "#8b5cf6" },
      "Clothing": { count: 0, color: "#ec4899" },
      "Jewelry": { count: 0, color: "#376e5e" },
      "Keys": { count: 0, color: "#f97316" },
      "Others": { count: 0, color: "#64748b" },
    };

    items.forEach((item) => {
      const text = `${item.title} ${item.desc || item.description || ""}`.toLowerCase();
      
      let cat = "Others";
      if (["phone", "laptop", "tablet", "charger", "headphone", "earphone", "computer", "iphone", "samsung", "ipad", "macbook", "gadget", "screen", "wire", "cable"].some(k => text.includes(k))) {
        cat = "Electronics";
      } else if (["bag", "backpack", "purse", "wallet", "luggage", "suitcase", "handbag", "pouch", "cardholder"].some(k => text.includes(k))) {
        cat = "Wallets & Bags";
      } else if (["dog", "cat", "pet", "bird", "animal", "puppy", "kitten", "collar", "leash"].some(k => text.includes(k))) {
        cat = "Pets";
      } else if (["document", "id", "passport", "license", "card", "paper", "folder", "book", "notebook", "national id", "student id", "voter id", "atm"].some(k => text.includes(k))) {
        cat = "Documents & Books";
      } else if (["jacket", "shirt", "pants", "uniform", "shoes", "hat", "scarf", "coat", "clothing", "socks", "cap", "t-shirt"].some(k => text.includes(k))) {
        cat = "Clothing";
      } else if (["ring", "necklace", "bracelet", "watch", "earring", "jewelry", "diamond", "gold", "silver"].some(k => text.includes(k))) {
        cat = "Jewelry";
      } else if (["key", "keychain", "fob", "car key"].some(k => text.includes(k))) {
        cat = "Keys";
      }

      counts[cat].count++;
    });

    const total = items.length;
    return Object.keys(counts).map((key) => {
      const item = counts[key];
      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return {
        name: key,
        count: item.count,
        percentage: pct,
        color: item.color,
      };
    });
  }, [items]);

  // Dynamic Location statistics based on reported location grouping
  const locationStats = useMemo(() => {
    const groups: { [key: string]: { total: number; resolved: number; name: string } } = {};
    items.forEach((item) => {
      let loc = (item.location || "Unknown").trim();
      loc = loc.split(",")[0].trim();
      if (!loc) loc = "General";
      
      const key = loc.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      
      if (!groups[key]) {
        groups[key] = { total: 0, resolved: 0, name: key };
      }
      groups[key].total++;
      if (item.claimed) {
        groups[key].resolved++;
      }
    });

    return Object.values(groups)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((g) => {
        const rate = g.total > 0 ? Math.round((g.resolved / g.total) * 100) : 0;
        let trendIcon = "trending_flat";
        let trendColor = "text-on-surface-variant bg-surface-variant";
        let trendText = "0%";
        if (rate >= 75) {
          trendIcon = "trending_up";
          trendColor = "text-[#01725a] bg-[#9af4d6]/30";
          trendText = "+5%";
        } else if (rate >= 50) {
          trendIcon = "trending_up";
          trendColor = "text-[#336dbe] bg-[#ccdaee]/30";
          trendText = "+2%";
        } else if (rate < 30 && g.total > 1) {
          trendIcon = "trending_down";
          trendColor = "text-[#af3d3b] bg-[#fa746f]/20";
          trendText = "-3%";
        }
        return {
          ...g,
          rate,
          trendIcon,
          trendColor,
          trendText,
        };
      });
  }, [items]);

  // In memory dynamic listing filter
  const filteredSearchList = useMemo(() => {
    return items.filter((r) => {
      const keywords =
        `${r.title} ${r.desc || r.description || ""} ${r.location}`.toLowerCase();

      // Keyword matching
      if (sQuery.trim() && !keywords.includes(sQuery.toLowerCase())) {
        return false;
      }

      // Category keywords browsing bounds
      if (categoryKeywords) {
        const hasKeywordMatch = categoryKeywords.some((kw) =>
          keywords.includes(kw.toLowerCase()),
        );
        if (!hasKeywordMatch) return false;
      }

      // Status dropdown
      if (sFilter === "lost") {
        if (r.type !== "lost" || r.claimed) return false;
      } else if (sFilter === "found") {
        if (r.type !== "found" || r.claimed) return false;
      } else if (sFilter === "claimed") {
        if (!r.claimed) return false;
      }

      // Advanced filters bounds
      if (
        sLoc.trim() &&
        !(r.location || "").toLowerCase().includes(sLoc.toLowerCase())
      ) {
        return false;
      }

      if (sDate.trim()) {
        const itemDateStr = r.date || "";
        if (!itemDateStr.includes(sDate)) return false;
      }

      return true;
    });
  }, [items, sQuery, sFilter, sLoc, sDate, categoryKeywords]);

  // Compute matches scores for active queries
  const smartMatches = useMemo(() => {
    if (sQuery.trim().length < 3) return [];

    const fake = {
      id: "fake_search",
      title: sQuery,
      desc: "",
      location: "",
      type: "lost",
      createdAt: Date.now(),
      claimed: false,
    };

    return items
      .filter((r) => r.type === "found" && !r.claimed)
      .map((r) => ({ report: r, score: computeMatchScore(fake, r) }))
      .filter((x) => x.score > 0.12)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [items, sQuery]);

  // Complete clean JSX structure wrapping converted index.html tags
  return (
    <div className="relative min-h-screen bg-[#f0f4f8]">
      {/* ── TOAST MESSAGES FLOATER ── */}
      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-msg ${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── IMMERSIVE BACKGROUND GRID (Only on landing or auth views) ── */}
      {(currentView === "login" ||
        currentView === "signup" ||
        currentView === "verify-email") && (
        <div className="fixed inset-0 bg-[#fdfae7] z-0"></div>
      )}

      {/* ── VIEW 1: LANDING PAGE ── */}
      {currentView === "landing" && (
        <div className="bg-[#fffbff] text-[#393927] font-sans antialiased overflow-x-hidden min-h-screen flex flex-col">
          {/* TopNavBar */}
          <header className="w-full top-0 z-50 bg-[#fffbff] shadow-sm sticky">
            <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-7xl mx-auto">
              <div className="font-sans text-2xl font-bold text-[#01725a] tracking-tight flex items-center gap-2">
                <MapPin className="h-6 w-6 text-[#01725a]" />
                FindTrack
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <button onClick={() => setCurrentView("landing")} className="text-[#01725a] border-b-2 border-[#01725a] pb-1 font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Home</button>
                <button onClick={() => setCurrentView("help")} className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">How it Works</button>
                <button onClick={() => setCurrentView("about")} className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Community</button>
                <button onClick={() => setCurrentView("safety")} className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Safety</button>
              </nav>
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView("login")} className="hidden md:block text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200 scale-95 active:scale-90">Login</button>
                <button onClick={() => setCurrentView("signup")} className="bg-[#01725a] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#00654f] transition-colors scale-95 active:scale-90">Get Started</button>
                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden p-2 text-[#666551] hover:text-[#01725a]"
                  onClick={() => setLandingMenuOpen(!landingMenuOpen)}
                >
                  {landingMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Nav Dropdown */}
          {landingMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-xl z-50 p-6 flex flex-col gap-4 border-b border-slate-100">
              <button onClick={() => { setCurrentView("landing"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Home</button>
              <button onClick={() => { setCurrentView("help"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">How it Works</button>
              <button onClick={() => { setCurrentView("about"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Community</button>
              <button onClick={() => { setCurrentView("safety"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Safety</button>
              <hr className="border-slate-100 my-2" />
              <button 
                onClick={() => {
                  setLandingMenuOpen(false);
                  setCurrentView("login");
                }}
                className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  setLandingMenuOpen(false);
                  setCurrentView("signup");
                }}
                className="bg-[#01725a] hover:bg-[#00654f] text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors shadow-sm mt-2"
              >
                Get Started
              </button>
            </div>
          )}

          <main className="flex-1">
            {/* Hero Section */}
            <section className="relative min-h-[921px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img className="w-full h-full object-cover object-center" alt="Hero background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDC3YRMFuO-lEwm9bKTIguR-1belAnXoHIgeigQ3q4SUYgObcsSiNUjHnpR_ZfqvyDsqJKY7pe4fPQ9fAxiXPLcUxQOJOcX6tgsnNpBIFjznIY1JDEnT0amN_j0g91NAtN4xOqL_xe6gYYA1U5PBGH18oRD2F1fn_Z1eAqQ2CYzkwKBwB-0d16PaU0F6IfiXoXHmT6Txuseum5Be0PuKe26wtdeMNMjFB0UJczwaKK0iUeWAfbVmcG-yd4WQJ83LfWGXw7GPVkDQ"/>
                <div className="absolute inset-0 bg-[#fffbff]/30 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#fffbff] via-transparent to-transparent"></div>
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center mt-8 w-full">
                <div className="bg-white/85 backdrop-blur-md border border-white/30 p-8 md:p-12 rounded-xl inline-block max-w-3xl shadow-lg w-full">
                  <h1 className="font-sans text-4xl md:text-[48px] md:leading-[56px] font-bold text-[#00654f] mb-4">
                    Find what's lost.<br/>Restore community trust.
                  </h1>
                  <p className="font-sans text-lg text-[#666551] mb-8 max-w-2xl mx-auto">
                    FindTrack helps Filipinos recover lost belongings through trusted community reporting and verified recovery workflows.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={() => setCurrentView("signup")}
                      className="w-full sm:w-auto bg-[#fab83f] text-[#553900] px-6 py-3 rounded-lg font-semibold text-sm shadow-md hover:bg-[#ebaa32] transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Start Reporting
                    </button>
                    <button 
                      onClick={handleGuestBrowse}
                      className="w-full sm:w-auto border-2 border-[#01725a] text-[#01725a] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#01725a]/5 transition-colors"
                    >
                      How it Works
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Value Propositions (Bento Grid) */}
            <section className="py-24 bg-[#ffffff]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                  <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#00654f] mb-2">Three Pillars of Recovery</h2>
                  <p className="font-sans text-base text-[#666551] max-w-xl mx-auto">A seamless workflow designed to bring your items back home.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pillar 1 */}
                  <div className="bg-[#f7f4df] rounded-xl p-6 flex flex-col items-start border border-[#bcbaa2]/30 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[#9af4d6] text-[#005d49] rounded-full flex items-center justify-center mb-4">
                      <FileSearch className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-xl font-bold text-[#00654f] mb-2">Report</h3>
                    <p className="font-sans text-base text-[#666551]">Quickly document lost or found items with AI-assisted details for precise matching.</p>
                  </div>
                  {/* Pillar 2 */}
                  <div className="bg-[#fdfae7] rounded-xl p-6 flex flex-col items-start border border-[#bcbaa2]/30 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[#b5eedb] text-[#235b4c] rounded-full flex items-center justify-center mb-4">
                      <MessageSquareHeart className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-xl font-bold text-[#00654f] mb-2">Connect</h3>
                    <p className="font-sans text-base text-[#666551]">Securely message community members when a match is found, protecting your privacy.</p>
                  </div>
                  {/* Pillar 3 */}
                  <div className="bg-[#f7f4df] rounded-xl p-6 flex flex-col items-start border border-[#bcbaa2]/30 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[#fab83f] text-[#553900] rounded-full flex items-center justify-center mb-4">
                      <Handshake className="w-6 h-6" />
                    </div>
                    <h3 className="font-sans text-xl font-bold text-[#00654f] mb-2">Recover</h3>
                    <p className="font-sans text-base text-[#666551]">Follow verified hand-off protocols to ensure items return home safely and securely.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Community Section */}
            <section className="py-24 bg-[#f7f4df]">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#00654f] mb-4">By the Community,<br/>For the Community.</h2>
                    <p className="font-sans text-lg text-[#666551] mb-6">Built on the foundation of Bayanihan, FindTrack empowers everyday Filipinos to look out for one another.</p>
                    <div className="flex gap-6 mb-8">
                      <div>
                        <div className="font-sans text-3xl font-bold text-[#01725a]">{new Set(items.map(i => i.userId)).size}</div>
                        <div className="font-sans text-sm font-medium text-[#666551]">Community Members</div>
                      </div>
                      <div className="w-px bg-[#bcbaa2]/50"></div>
                      <div>
                        <div className="font-sans text-3xl font-bold text-[#fab83f]">{stats.claimed}</div>
                        <div className="font-sans text-sm font-medium text-[#666551]">Successful Recoveries</div>
                      </div>
                    </div>
                    {/* Testimonial Card (Placeholder for content team) */}
                    <div className="bg-white rounded-xl p-6 border border-[#bcbaa2]/30 shadow-sm relative opacity-70">
                      <Quote className="absolute top-4 right-4 text-[#bcbaa2]/30 w-10 h-10" />
                      <p className="font-sans text-base text-[#393927] mb-4 italic relative z-10">[Content Team: Insert real community testimonial here]</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                        </div>
                        <div>
                          <div className="font-sans text-sm text-[#393927] font-bold">[User Name]</div>
                          <div className="font-sans text-[10px] font-medium text-[#666551]">Community Hero</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg border border-[#bcbaa2]/20">
                    <img className="w-full h-full object-cover" alt="Community" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxlGOvC8tUv_qZ8mbCzoTfeO2pcAAWluudEQ74nJYhDiM6dKFkJnXAMN2tK4YBhxIv0KPww3WsGnpb6KywmxGohTQ6i90nv7w2u0RVCecjGnzgkXMAWIJCDNduz3N6uzUJzOO2X6hUbk8TdWW4cPEa870HJ5Ah1QvAKbwvSknJT3Vri6FIhh8Mm_4iOGeknwaECR9sIKas-PM3QZqG2o9wpOSp-eQc4Fnpoc0yWIHqiDg4zXr3mFK3NE8g9xXChlUOf26yIrPeeg"/>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="bg-[#ebe9cf] border-t border-[#bcbaa2]/30 w-full mt-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 px-4 md:px-8 max-w-7xl mx-auto">
              <div>
                <div className="font-sans text-2xl font-bold text-[#393927] mb-4 flex items-center gap-2"><MapPin className="h-6 w-6 text-[#01725a]"/>FindTrack</div>
                <p className="font-sans text-base text-[#666551] max-w-sm mb-4">© 2026 FindTrack Philippines. Empowering communities through trust and recovery.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <nav className="flex flex-col gap-3">
                  <a onClick={() => { setCurrentView("about"); window.history.pushState(null, "", "/about"); }} className="font-sans text-sm font-medium text-[#666551] hover:text-[#01725a] hover:underline transition-all opacity-80 hover:opacity-100 cursor-pointer">About Us</a>
                  <a onClick={() => { setCurrentView("privacy"); window.history.pushState(null, "", "/privacy"); }} className="font-sans text-sm font-medium text-[#666551] hover:text-[#01725a] hover:underline transition-all opacity-80 hover:opacity-100 cursor-pointer">Privacy Policy</a>
                  <a onClick={() => { setCurrentView("terms"); window.history.pushState(null, "", "/terms"); }} className="font-sans text-sm font-medium text-[#666551] hover:text-[#01725a] hover:underline transition-all opacity-80 hover:opacity-100 cursor-pointer">Terms of Service</a>
                </nav>
                <nav className="flex flex-col gap-3">
                  <a onClick={() => { setCurrentView("safety"); window.history.pushState(null, "", "/safety"); }} className="font-sans text-sm font-medium text-[#666551] hover:text-[#01725a] hover:underline transition-all opacity-80 hover:opacity-100 cursor-pointer">Safety Guidelines</a>
                  <a onClick={() => { setCurrentView("help"); window.history.pushState(null, "", "/help"); }} className="font-sans text-sm font-medium text-[#666551] hover:text-[#01725a] hover:underline transition-all opacity-80 hover:opacity-100 cursor-pointer">Help Center</a>
                  <a onClick={() => { setCurrentView("contact"); window.history.pushState(null, "", "/contact"); }} className="font-sans text-sm font-medium text-[#666551] hover:text-[#01725a] hover:underline transition-all opacity-80 hover:opacity-100 cursor-pointer">Contact Us</a>
                </nav>
              </div>
            </div>
          </footer>
        </div>
      )}
      {/* ── VIEW 2: LOGIN PAGE ── */}
      {currentView === "login" && (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-on-surface relative z-10">
          {/* Decorative Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-40 left-20 w-80 h-80 bg-tertiary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>

          {/* Login Card */}
          <main className="bg-white border border-outline-variant/30 shadow-[0_8px_32px_0_rgba(1,114,90,0.05)] w-full max-w-[400px] rounded-xl p-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-headline-lg text-4xl text-primary mb-3 cursor-pointer" onClick={() => setCurrentView("landing")}>FindTrack</h1>
              <p className="font-body-lg text-lg text-on-surface-variant">Welcome back to the community.</p>
            </div>

            {(!["localhost", "127.0.0.1"].includes(window.location.hostname) &&
              !window.location.hostname.endsWith(".run.app") &&
              !window.location.hostname.endsWith(".web.app") &&
              !window.location.hostname.endsWith(".firebaseapp.com")) && (
              <div 
                onClick={() => {
                  setRefererBlockedDomain(window.location.hostname);
                  setShowRefererModal(true);
                }}
                className="mb-6 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-start gap-2.5 cursor-pointer transition-colors text-left text-xs text-amber-900 shadow-sm"
              >
                <span className="text-sm shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold mb-0.5">Custom Domain Configuration</p>
                  <p className="text-amber-800 leading-normal">
                    Using a custom domain like <span className="font-mono bg-amber-100/50 px-1 py-0.5 rounded">{window.location.hostname}</span>? Ensure it is authorized in Firebase. <strong className="underline font-semibold block mt-1">View authorization steps →</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} name="login" className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5" strokeWidth={1.5} />
                  <input 
                    className="w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                    id="email" 
                    name="email" 
                    placeholder="you@example.com" 
                    required 
                    type="email"
                    autoComplete="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5" strokeWidth={1.5} />
                  <input 
                    className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={authPassword}
                    onChange={(e) => setAuthPass(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" 
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    type="button"
                    onClick={() => setCurrentView("reset")}
                    className="font-label-md text-sm text-primary hover:text-primary-dim transition-colors" 
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-body-lg text-lg font-medium hover:bg-primary-dim transition-colors shadow-sm flex items-center justify-center gap-3" 
                type="submit"
              >
                Login
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="font-body-md text-on-surface-variant">
                Don't have an account?{" "}
                <button 
                  onClick={() => setCurrentView("signup")}
                  className="text-primary font-semibold hover:underline transition-all"
                >
                  Sign up
                </button>
              </p>
            </div>
          </main>
        </div>
      )}

      {/* ── VIEW 3: SIGNUP PAGE ── */}
      {currentView === "signup" && (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-on-surface relative z-10">
          {/* Decorative Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-40 left-20 w-80 h-80 bg-tertiary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>

          {/* Signup Card */}
          <main className="bg-white border border-outline-variant/30 shadow-[0_8px_32px_0_rgba(1,114,90,0.05)] w-full max-w-[400px] rounded-xl p-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="font-headline-lg text-4xl text-primary mb-3 cursor-pointer" onClick={() => setCurrentView("landing")}>FindTrack</h1>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface">Create an account</h2>
              <p className="font-body-md text-sm text-on-surface-variant mt-1">
                Already a member?{" "}
                <button 
                  onClick={() => setCurrentView("login")}
                  className="font-semibold text-primary hover:underline transition-colors"
                >
                  Login here
                </button>
              </p>
            </div>

            {(!["localhost", "127.0.0.1"].includes(window.location.hostname) &&
              !window.location.hostname.endsWith(".run.app") &&
              !window.location.hostname.endsWith(".web.app") &&
              !window.location.hostname.endsWith(".firebaseapp.com")) && (
              <div 
                onClick={() => {
                  setRefererBlockedDomain(window.location.hostname);
                  setShowRefererModal(true);
                }}
                className="mb-4 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-start gap-2.5 cursor-pointer transition-colors text-left text-xs text-amber-900 shadow-sm"
              >
                <span className="text-sm shrink-0">⚠️</span>
                <div>
                  <p className="font-semibold mb-0.5">Custom Domain Configuration</p>
                  <p className="text-amber-800 leading-normal">
                    Using a custom domain like <span className="font-mono bg-amber-100/50 px-1 py-0.5 rounded">{window.location.hostname}</span>? Ensure it is authorized in Firebase. <strong className="underline font-semibold block mt-1">View authorization steps →</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignupSubmit} name="signup" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-xs text-on-surface mb-1" htmlFor="firstName">First Name</label>
                  <input 
                    id="firstName" 
                    name="firstName" 
                    type="text" 
                    required 
                    autoComplete="given-name"
                    value={signupFirst}
                    onChange={(e) => setSignupFirst(e.target.value)}
                    className="block w-full rounded-lg border border-outline-variant/60 py-2.5 px-3 bg-surface-container-low shadow-sm placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md transition-shadow text-sm"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-xs text-on-surface mb-1" htmlFor="lastName">Last Name</label>
                  <input 
                    id="lastName" 
                    name="lastName" 
                    type="text" 
                    required 
                    autoComplete="family-name"
                    value={signupLast}
                    onChange={(e) => setSignupLast(e.target.value)}
                    className="block w-full rounded-lg border border-outline-variant/60 py-2.5 px-3 bg-surface-container-low shadow-sm placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md transition-shadow text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-xs text-on-surface mb-1" htmlFor="signup-email-field">Email address</label>
                <input 
                  id="signup-email-field" 
                  name="email" 
                  type="email" 
                  required 
                  autoComplete="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="block w-full rounded-lg border border-outline-variant/60 py-2.5 px-3 bg-surface-container-low shadow-sm placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md transition-shadow text-sm"
                />
              </div>

              <div>
                <label className="block font-label-md text-xs text-on-surface mb-1" htmlFor="phone">Phone Number (Optional)</label>
                <input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  value={signupContact}
                  onChange={(e) => setSignupContact(e.target.value)}
                  className="block w-full rounded-lg border border-outline-variant/60 py-2.5 px-3 bg-surface-container-low shadow-sm placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md transition-shadow text-sm"
                />
              </div>

              <div>
                <label className="block font-label-md text-xs text-on-surface mb-1" htmlFor="signup-password-field">Password</label>
                <div className="relative">
                  <input 
                    id="signup-password-field" 
                    name="password" 
                    type={showPass ? "text" : "password"}
                    required 
                    autoComplete="new-password"
                    value={authPassword}
                    onChange={(e) => setAuthPass(e.target.value)}
                    className="block w-full rounded-lg border border-outline-variant/60 py-2.5 px-3 bg-surface-container-low shadow-sm placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none font-body-md transition-shadow text-sm pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" 
                  >
                    {showPass ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  required 
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low"
                />
                <label className="ml-3 block font-body-md text-xs text-on-surface-variant" htmlFor="terms">
                  I agree to the <button type="button" onClick={() => setCurrentView("terms")} className="text-primary hover:underline">Terms of Service</button> and <button type="button" onClick={() => setCurrentView("privacy")} className="text-primary hover:underline">Privacy Policy</button>.
                </label>
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={loadingAuth}
                  className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 font-label-md text-sm font-semibold text-on-primary shadow-sm hover:bg-primary-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70 mt-2"
                >
                  {loadingAuth ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          </main>
        </div>
      )}

      {/* ── VIEW 5: VERIFY EMAIL SCREEN ── */}
      {currentView === "verify-email" && (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4] text-slate-900 font-sans p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 md:p-10 text-center border border-slate-100">
            <div className="w-24 h-24 mx-auto mb-6 bg-teal-50 rounded-full flex items-center justify-center">
              <Mail className="w-12 h-12 text-[#1A7B72]" strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl font-bold text-[#1A7B72] mb-4">
              Verify your email address
            </h2>
            <p className="text-slate-600 mb-2">
              We've sent a verification link to{" "}
              <strong className="text-slate-900">
                {auth.currentUser?.email ||
                  profileEmail ||
                  "your email address"}
              </strong>
              .
            </p>
            <p className="text-slate-600 mb-8">
              Please click the link to confirm your account.
            </p>

            <div className="space-y-4">
              <button
                onClick={async () => {
                  try {
                    if (auth.currentUser) {
                      await auth.currentUser.reload();
                      if (auth.currentUser.emailVerified) {
                        await auth.currentUser.getIdToken(true);
                        triggerToast(
                          "✅ Verification successful! Welcome to FindTrack.",
                          "success",
                        );
                        setCurrentView("dashboard");
                      } else {
                        triggerToast(
                          "ℹ️ Email is not verified yet. Please check your inbox.",
                          "error",
                        );
                      }
                    } else {
                      triggerToast(
                        "❌ Session lost. Please log in again.",
                        "error",
                      );
                      setCurrentView("login");
                    }
                  } catch (e: any) {
                    console.error(e);
                    triggerToast(
                      "❌ " + (e.message || "Failed to check status."),
                      "error",
                    );
                  }
                }}
                className="w-full bg-[#B2D235] hover:bg-[#A1C124] text-slate-900 py-3.5 rounded-xl font-semibold transition-colors shadow-sm"
              >
                Check Verification Status
              </button>

              <button
                onClick={async () => {
                  if (resendCooldown > 0) return;
                  try {
                    if (auth.currentUser) {
                      const actionCodeSettings = {
                        url: window.location.origin,
                        handleCodeInApp: false,
                      };
                      await sendEmailVerification(
                        auth.currentUser,
                        actionCodeSettings,
                      );
                      triggerToast("✅ Verification email resent!", "success");
                      setResendCooldown(30);
                    } else {
                      triggerToast(
                        "❌ Session lost. Please log in again.",
                        "error",
                      );
                      setCurrentView("login");
                    }
                  } catch (e: any) {
                    console.error("Resend error:", e);
                    if (e.message?.includes("too-many-requests")) {
                      triggerToast(
                        "❌ Too many requests. Please wait a minute and try again.",
                        "error",
                      );
                      setResendCooldown(60);
                    } else {
                      triggerToast(
                        "❌ Failed to resend. Please try again later.",
                        "error",
                      );
                    }
                  }
                }}
                disabled={resendCooldown > 0}
                className={`w-full py-3.5 rounded-xl font-semibold transition-colors border-2 ${
                  resendCooldown > 0
                    ? "border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50"
                    : "border-[#1A7B72] text-[#1A7B72] hover:bg-[#1A7B72]/10"
                }`}
              >
                {resendCooldown > 0
                  ? `Resend Available in ${resendCooldown}s`
                  : "Resend Email"}
              </button>

              <button
                onClick={async () => {
                  await logOut();
                  setCurrentView("landing");
                }}
                className="w-full py-3 text-sm font-medium text-[#1A7B72] hover:text-[#15605A] underline transition-colors mt-2"
              >
                Change Email Address
              </button>

              <div className="mt-6 pt-4 border-t border-slate-100 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setRefererBlockedDomain(window.location.hostname);
                    setShowRefererModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs transition-colors font-medium shadow-sm"
                >
                  <span className="text-sm">❓</span>
                  <span>Link says "Expired or already used"? Click here!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 6: PRIVACY POLICY PAGE ── */}
      {currentView === "privacy" && (
        <div
          style={{
            minHeight: "100vh",
            background:
              "radial-gradient(ellipse at bottom, #1e293b 0%, #0f172a 100%)",
            color: "#f8fafc",
            padding: "40px 16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              width: "100%",
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "36px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
            className="mx-auto"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                paddingBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "32px" }}>🔒</span>
                <div>
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      lineHeight: 1.2,
                    }}
                  >
                    Privacy Policy
                  </h1>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: "4px",
                    }}
                  >
                    FindTrack Lost &amp; Found Platform
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackToSafety}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
                className="hover:bg-white/20 transition-all"
              >
                ← Go Back
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                fontSize: "14px",
                lineHeight: "1.7",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  1. Introduction
                </h3>
                <p>
                  Welcome to FindTrack. We are dedicated to protecting your
                  personal information and your right to privacy. This Privacy
                  Policy describes how we collect, use, and process your
                  information when you use our lost and found platform.
                </p>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  2. Information We Collect
                </h3>
                <p>
                  To provide our services, facilitate claiming, and enable safe
                  communications, we collect the following personal details:
                </p>
                <ul
                  style={{
                    listStyleType: "disc",
                    paddingLeft: "20px",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <li>
                    <strong>Account Credentials:</strong> Full name, verified
                    email address, and profile pictures when you register.
                  </li>
                  <li>
                    <strong>Contact Information:</strong> Phone numbers or
                    social handle contact info you voluntarily provide so
                    claimants/finders can get in touch with you.
                  </li>
                  <li>
                    <strong>Item Reports Data:</strong> Item characteristics,
                    dates, text descriptions, images of lost or found
                    belongings, and exact or approximate locations where items
                    were misplaced or recovered.
                  </li>
                </ul>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  3. How We Use Your Information
                </h3>
                <p>
                  We process your personal information for purposes based on
                  legitimate interests, the fulfillment of our services, and
                  user convenience:
                </p>
                <ul
                  style={{
                    listStyleType: "disc",
                    paddingLeft: "20px",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <li>
                    To facilitate user account creation, profile management, and
                    authentication check-ins.
                  </li>
                  <li>
                    To list lost/found items and coordinate ownership claims
                    between users.
                  </li>
                  <li>
                    To send real-time alerts or email matchmaker suggestions and
                    notifications about matching items.
                  </li>
                  <li>
                    To provide direct communication channels specifically for
                    coordinating item returns.
                  </li>
                </ul>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  4. Data Security &amp; Storage
                </h3>
                <p>
                  Your account, contact profile information, and reported item
                  details are safely stored using secure Cloud
                  Firebase/Firestore infrastructure. Only authorized users can
                  update their profiles or manage active items. We implement
                  security protocols to protect your personal information
                  against unauthorized retrieval, alteration, or disclosure.
                </p>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  5. Your Rights &amp; Data Deletion
                </h3>
                <p>
                  You can access, modify, or delete your personal contact
                  coordinates at any time directly through the{" "}
                  <strong>My Profile</strong> or <strong>My Items</strong>{" "}
                  dashboards. If you wish to completely close your account or
                  wipe your listing data, please reach out to our team or use
                  the direct profile purge settings.
                </p>
              </section>
            </div>

            <div
              style={{
                marginTop: "40px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                paddingTop: "20px",
                textAlign: "center",
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Last updated:{" "}
              {new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · FindTrack Platform Security
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 7: TERMS OF SERVICE PAGE ── */}
      {currentView === "terms" && (
        <div
          style={{
            minHeight: "100vh",
            background:
              "radial-gradient(ellipse at bottom, #1e293b 0%, #0f172a 100%)",
            color: "#f8fafc",
            padding: "40px 16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              width: "100%",
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "24px",
              padding: "36px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
            className="mx-auto"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                paddingBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "32px" }}>⚖️</span>
                <div>
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      lineHeight: 1.2,
                    }}
                  >
                    Terms of Service
                  </h1>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: "4px",
                    }}
                  >
                    FindTrack Lost &amp; Found Platform
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackToSafety}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
                className="hover:bg-white/20 transition-all"
              >
                ← Go Back
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                fontSize: "14px",
                lineHeight: "1.7",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  1. Agreement to Terms
                </h3>
                <p>
                  By registering, logging in, browsing as a guest, or submitting
                  reports on FindTrack, you accept and agree to follow these
                  Terms of Service. If you do not agree to all of these Terms,
                  you are prohibited from using the application.
                </p>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  2. User Responsibilities &amp; Acceptable Use
                </h3>
                <p>
                  When posting lost or found items and interacting with other
                  community members, you agree to:
                </p>
                <ul
                  style={{
                    listStyleType: "disc",
                    paddingLeft: "20px",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <li>
                    Provide accurate, genuine, and reliable details regarding
                    found objects, locations, and descriptions.
                  </li>
                  <li>
                    Refrain from listing fraudulent claims, fake items,
                    offensive photos, or inaccurate contact information.
                  </li>
                  <li>
                    Respect other users and use the interactive real-time
                    coordinates, chats, and claims desk only for legitimate
                    recovery purposes.
                  </li>
                  <li>
                    Never attempt to gain unauthorized access to other user
                    profiles, databases, or restricted platform APIs.
                  </li>
                </ul>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  3. Verification of Ownership &amp; Meetups
                </h3>
                <p>
                  FindTrack provides verification mechanisms (such as custom
                  security confirmation questions) to help confirm proof of
                  ownership prior to release. However:
                </p>
                <ul
                  style={{
                    listStyleType: "disc",
                    paddingLeft: "20px",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <li>
                    Users are solely responsible for thoroughly vetting proof of
                    ownership before handing over items.
                  </li>
                  <li>
                    Physical meetups, handling of high-value items, and
                    exchanges are at your own discretion. We encourage
                    coordinating safe, public, well-lit spaces (such as security
                    desk areas, campuses, or official lost and found centers).
                  </li>
                </ul>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  4. Disclaimer of Warrant &amp; Limitation of Liability
                </h3>
                <p>
                  FindTrack is provided "as is" and "as available". We do not
                  guarantee that your lost items will be found, or that matches
                  suggested by the system are 100% correct. Under no
                  circumstances shall FindTrack, our developers, or our
                  affiliates be liable for damages, item damage, theft, fraud,
                  or any conflicts arising from physical item exchange
                  coordinates.
                </p>
              </section>

              <section>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#38bdf8",
                    marginBottom: "8px",
                  }}
                >
                  5. Modifications to Service
                </h3>
                <p>
                  We reserves the right to modify or adjust the features,
                  layouts, database rules, or services of FindTrack at any time.
                  Continued use of the platform after updates indicates consent
                  to all revised guidelines.
                </p>
              </section>
            </div>

            <div
              style={{
                marginTop: "40px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                paddingTop: "20px",
                textAlign: "center",
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Last updated:{" "}
              {new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · FindTrack Community Terms
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 8: ABOUT US PAGE ── */}
      {currentView === "about" && (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
          <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: "bold", fontSize: "24px", color: "#01725a", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => { setCurrentView("landing"); window.history.pushState(null, "", "/"); }}>
              <MapPin className="h-6 w-6 text-[#01725a]"/>
              FindTrack
            </div>
          </header>
          <div style={{ maxWidth: "800px", margin: "40px auto", padding: "40px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#00654f", marginBottom: "24px" }}>About Us</h1>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
              FindTrack is a community-driven lost and found platform dedicated to helping people recover their lost items across the Philippines.
              Our mission is to foster a culture of honesty and trust (Bayanihan) by providing a secure and accessible platform for reporting and recovering lost belongings.
            </p>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
              Whether you've lost something precious or found an item that needs returning, FindTrack is here to bridge the gap and make recovery easier.
            </p>
          </div>
        </div>
      )}

      {/* ── VIEW 9: SAFETY GUIDELINES PAGE ── */}
      {currentView === "safety" && (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
          <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: "bold", fontSize: "24px", color: "#01725a", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => { setCurrentView("landing"); window.history.pushState(null, "", "/"); }}>
              <MapPin className="h-6 w-6 text-[#01725a]"/>
              FindTrack
            </div>
          </header>
          <div style={{ maxWidth: "800px", margin: "40px auto", padding: "40px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#00654f", marginBottom: "24px" }}>Safety Guidelines</h1>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
              Your safety is our top priority. When meeting to return or retrieve a lost item, please keep the following guidelines in mind:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", color: "#475569", lineHeight: "1.6", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><strong>Meet in Public Places:</strong> Always choose well-lit, public locations for handovers, such as cafes, malls, or police stations.</li>
              <li><strong>Bring a Friend:</strong> If possible, bring someone with you when meeting a stranger.</li>
              <li><strong>Verify Ownership:</strong> Ask identifying questions about the item before handing it over (e.g., unique marks, passwords for devices).</li>
              <li><strong>Do Not Share Personal Information:</strong> Avoid sharing your home address, financial details, or other sensitive information.</li>
              <li><strong>Trust Your Instincts:</strong> If a situation feels unsafe, cancel the meeting and report the user if necessary.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── VIEW 10: HELP CENTER PAGE ── */}
      {currentView === "help" && (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
          <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: "bold", fontSize: "24px", color: "#01725a", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => { setCurrentView("landing"); window.history.pushState(null, "", "/"); }}>
              <MapPin className="h-6 w-6 text-[#01725a]"/>
              FindTrack
            </div>
          </header>
          <div style={{ maxWidth: "800px", margin: "40px auto", padding: "40px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#00654f", marginBottom: "24px" }}>Help Center</h1>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
              Need assistance with using FindTrack? You're in the right place.
            </p>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>How to Report a Lost Item</h2>
              <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6" }}>
                1. Log in to your account and go to the Dashboard.<br/>
                2. Click on the "Report Item" button.<br/>
                3. Fill out the details (type, description, location) and upload a photo if available.<br/>
                4. Submit the report to alert the community.
              </p>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "12px" }}>How to Claim a Found Item</h2>
              <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6" }}>
                1. Browse the items feed on your Dashboard.<br/>
                2. If you spot an item that belongs to you, click "Claim item" (Hand icon).<br/>
                3. Provide proof of ownership in the message to the finder.<br/>
                4. Coordinate a safe handover.
              </p>
            </div>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
              Still need help? Please reach out to our support team at: <strong>novapulsarsupport@gmail.com</strong>
            </p>
          </div>
        </div>
      )}

      {/* ── VIEW 11: CONTACT US PAGE ── */}
      {currentView === "contact" && (
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
          <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: "bold", fontSize: "24px", color: "#01725a", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => { setCurrentView("landing"); window.history.pushState(null, "", "/"); }}>
              <MapPin className="h-6 w-6 text-[#01725a]"/>
              FindTrack
            </div>
          </header>
          <div style={{ maxWidth: "800px", margin: "40px auto", padding: "40px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#00654f", marginBottom: "24px" }}>Contact Us</h1>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
              We'd love to hear from you. Whether you have a question about our platform, need help with an item, or want to provide feedback, our team is ready to assist.
            </p>
            
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "24px", borderRadius: "8px", marginTop: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#166534", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail className="w-6 h-6" /> Email Support
              </h2>
              <p style={{ fontSize: "16px", color: "#166534", lineHeight: "1.6" }}>
                You can reach our support team directly at:<br/>
                <a href="mailto:novapulsarsupport@gmail.com" style={{ fontWeight: "bold", textDecoration: "underline", color: "#15803d", fontSize: "18px", display: "inline-block", marginTop: "8px" }}>
                  novapulsarsupport@gmail.com
                </a>
              </p>
              <p style={{ fontSize: "14px", color: "#15803d", marginTop: "12px" }}>
                We typically respond within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 4: MAIN DASHBOARD PORTAL ── */}
      {currentView === "dashboard" && (
        <div className="flex h-[100dvh] bg-surface-container-lowest text-on-surface font-body-md overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* SIDEBAR (Desktop) */}
          <aside className={`fixed md:relative z-50 flex flex-col w-64 h-full bg-[#00725a] text-white shadow-md transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
            {/* Brand Header */}
            <div className="pt-8 pb-6 px-7 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight text-white font-sans leading-none">FindTrack</h1>
                  <p className="text-xs font-medium tracking-wide text-white/75 mt-2">Community Lost & Found</p>
                </div>
                <button 
                  className="md:hidden text-white/70 hover:text-white p-1 rounded-lg bg-white/10" 
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto space-y-1 px-4 py-2">
              {[
                { id: "home", label: "Home", icon: Home },
                { id: "report", label: "Report Item", icon: PlusCircle },
                { id: "search", label: "Search", icon: Search },
                { id: "notifications", label: "Alerts", icon: Bell },
                { id: "profile", label: "Profile", icon: UserIcon },
                { id: "myitems", label: "My Items", icon: Archive },
                { id: "pinned", label: "Pinned Items", icon: Pin },
                { id: "categories", label: "Categories", icon: Shapes },
                { id: "analytics", label: "Analytics", icon: BarChart2 },
                { id: "tips", label: "Recovery Tips", icon: HeartHandshake },
                { id: "packaging", label: "Packaging Tips", icon: Package },
                { id: "about", label: "About / Help", icon: HelpCircle }
              ].map((item) => {
                const isSelected = activeTab === item.id || (activeTab === "itemDetail" && item.id === "search") || (activeTab === "claimItem" && item.id === "search");
                
                if (item.id === "about") {
                  return (
                    <div key={item.id} className="pt-4 pb-2">
                      <button
                        onClick={() => {
                          setActiveTab("about");
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3.5 rounded-xl bg-[#9effda] hover:bg-[#83ebd0] text-[#004d3c] font-semibold transition-all duration-200 shadow-sm gap-3 text-left"
                      >
                        <item.icon className="h-5 w-5 text-[#004d3c] shrink-0" />
                        <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (profileName === "Guest" && ["report", "analytics", "profile", "myitems", "pinned"].includes(item.id)) {
                        setShowGuestModal(true);
                      } else {
                        setActiveTab(item.id);
                        if (item.id === "home" || item.id === "search") setCategoryKeywords(null);
                      }
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 text-left gap-4 ${
                      isSelected
                        ? "bg-white/15 text-white font-semibold shadow-sm" 
                        : "text-white/85 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${isSelected ? "text-white" : "opacity-80"}`} />
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer Items */}
            <div className="p-4 px-7 border-t border-white/10 shrink-0">
              <button 
                onClick={() => {
                  if (profileName === "Guest") handleGuestBrowse();
                  else logOut();
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-white/80 hover:text-white hover:bg-white/5 text-sm"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 opacity-80" />
                  <span className="font-medium">{profileName === "Guest" ? "Login / Sign Up" : "Logout"}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md text-white/70">
                  {profileName === "Guest" ? "Guest" : "User"}
                </span>
              </button>
            </div>
</aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* TOP BAR */}
            <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-surface-container-lowest border-b border-outline-variant z-40">
              <div className="flex items-center gap-4">
                <button 
                  className="md:hidden text-on-surface"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="relative hidden sm:block" onClick={() => setActiveTab('search')}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                  <input 
                    type="text" 
                    placeholder="Search community..."
                    className="pl-10 pr-4 py-2 bg-surface-container rounded-full text-sm border-none focus:ring-2 focus:ring-primary outline-none w-64 pointer-events-none"
                    readOnly
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (profileName === "Guest") setShowGuestModal(true);
                    else setActiveTab("report");
                  }}
                  className="hidden sm:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-dim transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Report Item
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {alerts.filter(a => !a.read).length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>}
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold cursor-pointer">
                  {profileName === "Guest" ? "G" : profileName.charAt(0).toUpperCase()}
                </div>
              </div>
            </header>

            {/* MAIN PANELS INJECTION DESK */}

          <main className="flex-1 overflow-y-auto bg-surface-container-low p-4 pb-28 md:p-6 lg:p-8 relative">
            {/* PANEL: HOME */}
            <section
              id="home"
              className={`${activeTab === "home" ? "flex" : "hidden"} max-w-5xl mx-auto h-full flex-col`}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                Magandang araw 👋
              </h1>
              
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#D3E8E5] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                    <ShoppingBag className="w-8 h-8 text-[#1A7B72] mb-3" strokeWidth={1.5} />
                    <div className="text-sm font-medium text-[#15605A] leading-tight mb-1">Items<br/>Reported:</div>
                    <div className="text-3xl font-bold text-[#1A7B72]">{stats.lost + stats.found}</div>
                  </div>
                  <div className="bg-[#E2F0D9] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                    <Search className="w-8 h-8 text-[#1A7B72] mb-3" strokeWidth={1.5} />
                    <div className="text-sm font-medium text-[#15605A] leading-tight mb-1">Items<br/>Found:</div>
                    <div className="text-3xl font-bold text-[#1A7B72]">{stats.found}</div>
                  </div>
                  <div className="bg-[#D3E8E5] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                    <Users className="w-8 h-8 text-[#1A7B72] mb-3" strokeWidth={1.5} />
                    <div className="text-sm font-medium text-[#15605A] leading-tight mb-1">Community<br/>Members:</div>
                    <div className="text-3xl font-bold text-[#1A7B72]">{new Set(items.map(i => i.userId).filter(Boolean)).size || 1}</div>
                  </div>
                  <div className="bg-[#D3E8E5] p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
                    <CheckSquare className="w-8 h-8 text-[#1A7B72] mb-3" strokeWidth={1.5} />
                    <div className="text-sm font-medium text-[#15605A] leading-tight mb-1">Recoveries<br/>This Week:</div>
                    <div className="text-3xl font-bold text-[#1A7B72]">{stats.claimed}</div>
                  </div>
              </div>

              {/* Content row */}
              <div className="grid md:grid-cols-2 gap-6 mb-8 flex-1 min-h-[400px]">
                  {/* Recent Community Activity */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Community Activity</h2>
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                      {items.slice(0, 6).map((r) => (
                        <div key={r.id} className="text-sm border-b border-slate-50 pb-4 last:border-0">
                          <span className="font-semibold text-slate-800">{r.type === 'lost' ? 'Lost' : 'Found'} {r.title}</span> {r.location ? `in ${r.location}` : ''} - 
                          <span className="text-slate-500 ml-1">Reported by {r.contactName?.split(' ')[0] || 'Member'} ({r.date ? new Date(r.date).toLocaleDateString() : 'recently'})</span>
                        </div>
                      ))}
                      {items.length === 0 && <div className="text-slate-500 text-sm">No recent activity.</div>}
                    </div>
                  </div>
                  
                  {/* Private Messages */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Private Messages</h2>
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2 flex items-center justify-center flex-col text-slate-500">
                      <MessageSquare className="h-12 w-12 mb-3 text-slate-300" />
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs text-center mt-1">When someone contacts you about your reported item, it will appear here.</p>
                    </div>
                  </div>
              </div>

              {/* Footer Banner */}
              <div className="mt-auto bg-[#1A7B72] text-white text-center py-5 px-6 rounded-2xl font-medium shadow-md">
                Every recovered item strengthens the community.
              </div>
            </section>
            {/* PANEL: REPORT SUBMISSION */}
            <section
              id="report"
              className={`${activeTab === "report" ? "block" : "hidden"}`}
            >
              <div className="max-w-3xl mx-auto space-y-8">
                <header className="mb-8">
                  <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Report an Item</h2>
                  <p className="font-body-md text-on-surface-variant mt-2">Fill in the details below. Our smart matching system will help find the owner or the item.</p>
                </header>

                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                  {/* Stepper Header */}
                  <div className="flex border-b border-outline-variant bg-surface-variant/50">
                    <div className={`flex-1 py-4 px-6 text-center text-sm font-bold border-b-2 ${reportStep >= 1 ? 'border-primary text-primary' : 'border-transparent text-outline'}`}>
                      1. Basic Info
                    </div>
                    <div className={`flex-1 py-4 px-6 text-center text-sm font-bold border-b-2 ${reportStep >= 2 ? 'border-primary text-primary' : 'border-transparent text-outline'}`}>
                      2. Details
                    </div>
                    <div className={`flex-1 py-4 px-6 text-center text-sm font-bold border-b-2 ${reportStep >= 3 ? 'border-primary text-primary' : 'border-transparent text-outline'}`}>
                      3. Verification
                    </div>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (reportStep < 3) {
                        setReportStep(reportStep + 1);
                        return;
                      }
                      await handleReportSubmit(e);
                      setReportStep(1);
                    }}
                    className="p-6 md:p-8 space-y-6"
                  >
                    {/* STEP 1: Basic Info */}
                    <div className={`space-y-6 ${reportStep === 1 ? 'block' : 'hidden'}`}>
                      <div className="space-y-3">
                        <label className="block font-label-md font-bold text-on-surface">I am reporting a...</label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${reportType === "lost" ? "border-error text-error bg-error/5 ring-2 ring-error/20" : "border-outline-variant text-on-surface-variant hover:bg-surface-variant"}`}>
                            <input type="radio" name="reportType" value="lost" checked={reportType === "lost"} onChange={() => setReportType("lost")} className="sr-only" />
                            <Search className="h-6 w-6" />
                            <span className="font-bold">Lost Item</span>
                          </label>
                          <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${reportType === "found" ? "border-primary text-primary bg-primary/5 ring-2 ring-primary/20" : "border-outline-variant text-on-surface-variant hover:bg-surface-variant"}`}>
                            <input type="radio" name="reportType" value="found" checked={reportType === "found"} onChange={() => setReportType("found")} className="sr-only" />
                            <PackageCheck className="h-6 w-6" />
                            <span className="font-bold">Found Item</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block font-label-md font-bold text-on-surface">Item Title</label>
                        <input type="text" required value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} placeholder="e.g. Blue Hydroflask" className="w-full bg-surface-variant border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-label-md font-bold text-on-surface">Location {reportType === "lost" ? "Lost" : "Found"}</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
                          <input type="text" required value={reportLocation} onChange={(e) => setReportLocation(e.target.value)} placeholder="e.g. Library 2nd Floor" className="w-full bg-surface-variant border-none rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* STEP 2: Details */}
                    <div className={`space-y-6 ${reportStep === 2 ? 'block' : 'hidden'}`}>
                      <div className="space-y-2">
                        <label className="block font-label-md font-bold text-on-surface">Description</label>
                        <textarea required value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={4} placeholder="Describe the item in detail (color, brand, unique marks...)" className="w-full bg-surface-variant border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="block font-label-md font-bold text-on-surface">Upload Image (Optional)</label>
                        <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:bg-surface-variant transition-colors cursor-pointer relative">
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setReportImageFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => setReportImage(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          {reportImage ? (
                            <div className="flex flex-col items-center">
                              <img src={reportImage} alt="Preview" className="h-32 object-contain rounded-lg mb-4 shadow-sm" />
                              <span className="text-sm font-medium text-primary">Change Image</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Camera className="h-10 w-10 text-outline mb-3" />
                              <span className="text-sm font-medium text-on-surface">Click to upload or drag and drop</span>
                              <span className="text-xs text-on-surface-variant mt-1">PNG, JPG up to 5MB</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* STEP 3: Verification */}
                    <div className={`space-y-6 ${reportStep === 3 ? 'block' : 'hidden'}`}>
                      <div className="p-4 bg-primary-container text-on-primary-container rounded-xl text-sm mb-6">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold mb-1">Protecting Ownership</p>
                            <p>To ensure this item is returned to its rightful owner, set a secret question that only the real owner would know.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block font-label-md font-bold text-on-surface">Secret Verification Question</label>
                        <input type="text" required value={reportSecurityQuestion} onChange={(e) => setReportSecurityQuestion(e.target.value)} placeholder="e.g. What is the wallpaper on the lock screen?" className="w-full bg-surface-variant border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                      </div>

                      <div className="space-y-2">
                        <label className="block font-label-md font-bold text-on-surface">Secret Answer</label>
                        <input type="text" required value={reportSecurityAnswer} onChange={(e) => setReportSecurityAnswer(e.target.value)} placeholder="e.g. A picture of a dog" className="w-full bg-surface-variant border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                        <p className="text-xs text-on-surface-variant mt-1">This answer will be hidden and used for verification.</p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-outline-variant flex justify-between items-center mt-8">
                      {reportStep > 1 ? (
                        <button type="button" onClick={() => setReportStep(reportStep - 1)} className="px-6 py-2.5 rounded-full font-label-md font-bold text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors">
                          Back
                        </button>
                      ) : <div></div>}
                      
                      <button type="submit" disabled={isUploading} className="px-6 py-2.5 rounded-full font-label-md font-bold bg-primary text-on-primary hover:bg-primary-dim transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
                        {isUploading ? "Uploading..." : reportStep < 3 ? "Continue" : (
                          <><Send className="h-4 w-4" /> Submit Report</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            {/* PANEL: SEARCH REGISTRY */}
            <section
              id="search"
              className={`${activeTab === "search" ? "block" : "hidden"} `}
            >
              <div className="p-4 md:p-8">
                {/* Search Header & Filters (Bento Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-8">
                  {/* Large Search Hero */}
                  <div className="md:col-span-8 bg-surface-container-high rounded-xl p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-cover bg-center"></div>
                    <div className="relative z-10">
                      <h2 className="font-headline-lg text-3xl font-bold text-primary mb-2">Find Lost Items</h2>
                      <p className="font-body-lg text-on-surface-variant mb-6">Search through our community database to find what you're looking for.</p>
                      <div className="relative flex items-center w-full shadow-sm rounded-lg overflow-hidden border border-outline-variant focus-within:border-primary transition-colors bg-surface">
                        <div className="pl-4 text-on-surface-variant">
                          <Search className="h-5 w-5" />
                        </div>
                        <input 
                          className="w-full px-4 py-4 bg-transparent border-none focus:ring-0 font-body-lg text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
                          placeholder="Search by keywords, brands, or descriptions..." 
                          type="text"
                          value={sQuery}
                          onChange={(e) => setSQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="md:col-span-4 flex flex-col gap-4">
                    <div className="bg-surface-container rounded-xl p-4 flex-1 border border-outline-variant/30 flex flex-col justify-center hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">Status</h3>
                          <select 
                            value={sFilter}
                            onChange={(e) => setSFilter(e.target.value)}
                            className="bg-transparent border-none p-0 font-headline-md text-lg text-primary focus:ring-0 cursor-pointer outline-none font-bold"
                          >
                            <option value="all">All Items</option>
                            <option value="lost">Lost Only</option>
                            <option value="found">Found Only</option>
                            <option value="claimed">Resolved</option>
                          </select>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                          <Filter className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-tertiary-container/20 rounded-xl p-4 flex-1 border border-tertiary-container/30 flex flex-col justify-center hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="w-full pr-2">
                          <h3 className="font-label-md text-xs text-tertiary uppercase tracking-wider mb-1">Location</h3>
                          <input 
                            value={sLoc}
                            onChange={(e) => setSLoc(e.target.value)}
                            placeholder="Type location..."
                            className="bg-transparent border-none p-0 w-full font-headline-md text-lg text-on-surface leading-tight focus:ring-0 outline-none placeholder:text-on-surface/50 font-bold"
                          />
                        </div>
                        <div className="w-10 h-10 shrink-0 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                          <MapPin className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Categories highlight info bar */}
                {categoryKeywords && (
                  <div className="mb-8 bg-primary-container/30 border border-primary-container/50 text-on-primary-container py-3 px-4 rounded-xl flex items-center justify-between">
                    <span className="font-body-md">Filtered by Category: <strong className="capitalize">{categoryKeywords[0]}</strong></span>
                    <button
                      onClick={() => setCategoryKeywords(null)}
                      className="font-label-md text-sm font-bold text-primary hover:text-primary-dim underline"
                    >
                      Clear Category Filter
                    </button>
                  </div>
                )}

                {/* SMART SUGGESTION MATCH BANNER COGNITIVE extraction */}
                {smartMatches.length > 0 && (
                  <div className="mb-8 bg-surface-container-low rounded-xl p-6 border border-primary-container shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-headline-md font-bold mb-4">
                      <Bot className="h-6 w-6" />
                      Smart Suggestions — Possible matches
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {smartMatches.map(({ report, score }) => {
                        const pct = Math.round(score * 100);
                        return (
                          <div
                            key={report.id}
                            onClick={() => {
                              setSelectedItemId(report.id);
                              setActiveTab("itemDetail");
                            }}
                            className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:border-primary cursor-pointer hover:shadow-md transition-all group"
                          >
                            <div className="font-headline-md text-base font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">{report.title}</div>
                            <div className="flex items-center text-sm text-on-surface-variant mb-2">
                              <MapPin className="h-3.5 w-3.5 mr-1" />{" "}
                              <span className="truncate">{report.location || "Unknown"}</span>
                            </div>
                            <div className="flex items-center text-xs font-bold text-primary">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{" "}
                              {pct}% AI Match Confidence
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Results Grid */}
                <div className="mb-6 flex justify-between items-end">
                  <h2 className="font-headline-md text-2xl font-bold text-on-surface">
                    Search Results <span className="text-on-surface-variant font-body-md font-normal ml-2 text-lg">({filteredSearchList.length} found)</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                  {filteredSearchList.map((r) => {
                    const pinned = pinnedIds.includes(r.id);
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          setSelectedItemId(r.id);
                          setActiveTab("itemDetail");
                        }}
                        className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer"
                      >
                        <div className="h-48 relative overflow-hidden bg-surface-variant flex items-center justify-center">
                          {r.image || r.imageUrl ? (
                            <img
                              src={r.image || r.imageUrl}
                              alt={r.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="opacity-30 text-outline">
                              <Camera className="h-12 w-12" />
                            </div>
                          )}
                          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full font-label-md text-xs font-semibold tracking-wide uppercase flex items-center gap-1 shadow-sm ${
                            r.claimed ? 'bg-primary-container text-on-primary-container' : 
                            r.type === 'found' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                          }`}>
                            {r.claimed ? <CheckCircle2 className="h-[14px] w-[14px]" /> : r.type === "found" ? <CheckCircle2 className="h-[14px] w-[14px]" /> : <Search className="h-[14px] w-[14px]" />}
                            {r.claimed ? "CLAIMED" : r.type === "found" ? "Found" : "Lost"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(r.id);
                            }}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${pinned ? "bg-tertiary text-on-tertiary shadow-md" : "bg-surface/80 backdrop-blur-sm text-on-surface-variant hover:text-primary"}`}
                          >
                            <MapPin className="h-[18px] w-[18px]" fill={pinned ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-headline-md text-base text-on-surface font-semibold line-clamp-1 group-hover:text-primary transition-colors">{r.title}</h3>
                          </div>
                          <p className="font-body-md text-on-surface-variant line-clamp-2 mb-4 text-sm">
                            {r.desc || r.description || "No description provided."}
                          </p>
                          <div className="mt-auto space-y-2">
                            <div className="flex items-center text-xs text-on-surface-variant">
                              <MapPin className="h-[14px] w-[14px] mr-1 text-primary shrink-0" />
                              <span className="truncate">{r.location || "Unknown location"}</span>
                            </div>
                            <div className="flex items-center text-xs text-on-surface-variant">
                              <Clock className="h-[14px] w-[14px] mr-1 text-primary shrink-0" />
                              <span>{r.date
                                ? new Date(r.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-lowest">
                          <button className={`w-full py-2 rounded font-label-md text-sm transition-colors text-center block shadow-sm ${
                            r.type === 'found' ? 'bg-primary text-on-primary hover:bg-primary-dim' : 'border border-primary text-primary hover:bg-primary-container/20'
                          }`}>
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredSearchList.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                    <div className="w-16 h-16 bg-primary-container/30 rounded-full flex items-center justify-center mb-4 border border-primary-container">
                      <Search className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No items found</h3>
                    <p className="font-body-md text-on-surface-variant">Try adjusting your search filters or keywords.</p>
                  </div>
                )}
              </div>
            </section>
{/* PANEL: ITEM DETAIL VIEW */}
            <section
              id="itemDetail"
              className={`${activeTab === "itemDetail" ? "block" : "hidden"} bg-background h-full w-full overflow-y-auto`}
            >
              {(() => {
                const r = items.find((x) => x.id === selectedItemId);
                if (!r)
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                      <Package className="h-12 w-12 mb-4 opacity-50" />
                      <p>Please choose an item from search.</p>
                    </div>
                  );

                return (
                  <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant pb-6">
                      <div>
                        <button
                          onClick={() => setActiveTab("search")}
                          className="inline-flex items-center gap-2 text-primary hover:text-primary-dim text-[12px] font-label-md mb-2 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Results
                        </button>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase ${r.type === "lost" ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"}`}>
                            {r.type === "lost" ? "LOST" : "FOUND"}
                          </span>
                          <span className="text-on-surface-variant text-[12px] font-label-md border-l border-outline-variant pl-3">
                            Ref #{r.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-[32px] sm:leading-[40px] font-headline-lg font-bold text-on-surface mt-3">
                          {r.title}
                        </h2>
                      </div>
                      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-primary shadow-sm border border-outline-variant">
                        <Share className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column (Image & AI) */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Image Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-surface-container-highest overflow-hidden relative aspect-video sm:aspect-[4/3] group">
                          {r.image || r.imageUrl ? (
                            <img
                              src={r.image || r.imageUrl}
                              alt={r.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-variant text-outline">
                              <Camera className="h-16 w-16 opacity-30" />
                            </div>
                          )}
                          {/* Carousel Dots Overlay */}
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer shadow-sm"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer shadow-sm"></div>
                          </div>
                        </div>

                        {/* Gemini AI Matchmaker Card */}
                        <div className="bg-surface-container-low rounded-xl p-4 sm:p-6 border border-primary-container relative overflow-hidden shadow-sm">
                          <div className="absolute inset-0 opacity-20 pointer-events-none"></div>
                          <div className="relative z-10 flex gap-4 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shadow-inner">
                              <Bot className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[16px] font-headline-md font-semibold text-primary">
                                  Gemini AI Matchmaker
                                </h3>
                                <button className="text-on-surface-variant hover:text-primary transition-colors">
                                  <RefreshCw className="h-5 w-5" />
                                </button>
                              </div>
                              <p className="text-[14px] font-body-md text-on-surface-variant leading-relaxed mb-3">
                                Our AI is actively cross-referencing this report against recent {r.type === 'lost' ? 'Found' : 'Lost'} listings in the area.
                              </p>
                              <div className="flex items-center gap-2 text-primary text-[12px] font-bold animate-pulse">
                                <Search className="h-4 w-4" /> Scanning local databases...
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column (Details & Contact) */}
                      <div className="lg:col-span-5 space-y-6">
                        {/* Item Details Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-surface-container-highest p-4 sm:p-6 lg:p-6 space-y-6">
                          <h3 className="text-[24px] font-headline-md font-semibold text-on-surface border-b border-surface-variant pb-3">
                            Item Details
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Tag className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-[12px] font-label-md text-on-surface-variant mb-0.5">
                                  Category
                                </p>
                                <p className="text-[14px] font-body-md text-on-surface font-medium capitalize">
                                  {(r as any).category || "General"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-[12px] font-label-md text-on-surface-variant mb-0.5">
                                  Date Logged
                                </p>
                                <p className="text-[14px] font-body-md text-on-surface font-medium">
                                  {r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recent'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-[12px] font-label-md text-on-surface-variant mb-0.5">
                                  Location
                                </p>
                                <p className="text-[14px] font-body-md text-on-surface font-medium">
                                  {r.location}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-surface-variant">
                            <p className="text-[12px] font-label-md text-on-surface-variant mb-2">
                              Description
                            </p>
                            <p className="text-[14px] font-body-md text-on-surface bg-surface-container rounded-lg p-3 border border-outline-variant/30 leading-relaxed whitespace-pre-wrap">
                              {r.desc || r.description || "No description provided."}
                            </p>
                          </div>
                        </div>

                        {/* Contact Credentials Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-surface-container-highest p-4 sm:p-6 lg:p-6 space-y-6">
                          <h3 className="text-[24px] font-headline-md font-semibold text-on-surface border-b border-surface-variant pb-3">
                            Contact Credentials
                          </h3>
                          <div className="flex items-center gap-4 bg-surface-container p-3 rounded-lg border border-outline-variant/30">
                            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-[24px] font-bold">
                              {r.contactName ? r.contactName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[12px] font-label-md text-on-surface-variant">
                                Reporter
                              </p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-[14px] font-headline-md font-semibold text-on-surface truncate">
                                  {r.contactName || "Verified Reporter"}
                                </p>
                                <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                              </div>
                              <p className="text-[14px] font-body-md text-on-surface-variant mt-0.5 select-none filter blur-[4px] opacity-70">
                                hidden.email@example.com
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <button 
                              onClick={() => {
                                if (profileName === 'Guest') {
                                  setShowGuestModal(true);
                                } else {
                                  handleStartChat(r.userId, r.id);
                                }
                              }}
                              className="w-full py-3 bg-primary text-on-primary text-[12px] font-label-md font-bold rounded-lg hover:bg-primary-dim transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Contact Chat Room
                            </button>
                            <button 
                              onClick={() => {
                                if (profileName === 'Guest') {
                                  setShowGuestModal(true);
                                } else {
                                  setActiveTab("claimItem");
                                }
                              }}
                              className="w-full py-3 bg-transparent border-2 border-secondary text-secondary hover:bg-secondary-container hover:text-on-secondary-container text-[12px] font-label-md font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Gavel className="h-4 w-4" />
                              Log Ownership Claim
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* PANEL: CLAIM ITEM VIEW */}
            <section
              id="claimItem"
              className={`${activeTab === "claimItem" ? "block" : "hidden"} bg-surface h-full w-full overflow-y-auto relative`}
            >
              {(() => {
                const r = items.find((x) => x.id === selectedItemId);
                if (!r)
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-on-surface-variant relative z-10">
                      <Package className="h-12 w-12 mb-4 opacity-50" />
                      <p>Please choose an item from search to claim.</p>
                    </div>
                  );

                return (
                  <>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 pb-12">
                      {/* Page Header */}
                      <header className="mb-6 sm:mb-8">
                        <h1 className="text-[32px] leading-[40px] font-headline-lg font-bold text-on-surface mb-2">Log Ownership Claim</h1>
                        <div className="flex items-center gap-2 text-primary">
                          <Shield className="h-5 w-5" fill="currentColor" />
                          <span className="text-[14px] font-body-md font-medium tracking-wide">Prove-It Verification Layer</span>
                        </div>
                      </header>

                      {/* Layout Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Main Form Area (Left Column) */}
                        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                          {/* Status Chip */}
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[12px] font-label-md shadow-sm border border-primary-fixed/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                              Current Claim Item
                            </span>
                          </div>

                          {/* Item Thumbnail Card */}
                          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 hover:shadow-md transition-shadow duration-300">
                            {r.image || r.imageUrl ? (
                              <img
                                src={r.image || r.imageUrl}
                                alt={r.title}
                                className="w-full sm:w-40 h-40 object-cover rounded-lg border border-outline-variant/20 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full sm:w-40 h-40 flex items-center justify-center bg-surface-variant rounded-lg border border-outline-variant/20 flex-shrink-0 text-outline">
                                <Camera className="h-10 w-10 opacity-30" />
                              </div>
                            )}
                            <div className="flex flex-col justify-center space-y-3 flex-1">
                              <h2 className="text-[24px] font-headline-md font-semibold text-on-surface">{r.title}</h2>
                              <div className="space-y-1.5 text-on-surface-variant text-[14px] font-body-md">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-primary-dim shrink-0" />
                                  <span className="truncate">Found at: <strong className="text-on-surface font-medium">{r.location}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary-dim shrink-0" />
                                  <span>Date Logged: <strong className="text-on-surface font-medium">{r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recent'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-primary-dim shrink-0" />
                                  <span>Item ID: <strong className="text-on-surface font-medium uppercase text-xs">FT-{r.id.substring(0,6)}</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verification Challenge Box */}
                          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary shadow-sm relative overflow-hidden">
                            <Info className="absolute -right-4 -bottom-4 h-[120px] w-[120px] text-primary/5 select-none pointer-events-none" />
                            <div className="relative z-10">
                              <h3 className="text-[12px] font-label-md text-primary tracking-widest uppercase mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Verification Question
                              </h3>
                              <p className="text-[16px] font-body-lg text-on-surface italic bg-surface-container-highest/50 p-4 rounded-lg border border-outline-variant/20">
                                "{r.securityQuestion || 'Describe this item in enough detail to prove ownership (e.g. scratches, contents, background).'}"
                              </p>
                            </div>
                          </div>

                          {/* User Input Form */}
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const answer = (form.elements.namedItem('claimAnswer') as HTMLTextAreaElement).value;
                            handleSubmitClaim(r.id, r.userId, r.securityQuestion || 'Describe this item in enough detail to prove ownership (e.g. scratches, contents, background).', answer);
                          }} className="space-y-4">
                            <div>
                              <label htmlFor="claimAnswer" className="block text-[12px] font-label-md font-medium text-on-surface mb-2">Your Answer</label>
                              <textarea
                                id="claimAnswer"
                                name="claimAnswer"
                                required
                                rows={5}
                                placeholder="Please provide specific details to prove ownership..."
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-[14px] font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-y shadow-inner"
                              ></textarea>
                            </div>

                            {/* Helper Text */}
                            <div className="flex items-start gap-3 p-3 bg-secondary-fixed/30 rounded-lg border border-secondary-fixed-dim/50">
                              <Info className="h-5 w-5 text-secondary-dim shrink-0 mt-0.5" />
                              <p className="text-[14px] font-body-md text-on-secondary-container leading-relaxed">
                                The finder will inspect this proof and action your contact credentials request. <span className="font-medium text-error-dim">False claims may result in account suspension.</span>
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-outline-variant/30 mt-8">
                              <button
                                type="button"
                                onClick={() => setActiveTab("itemDetail")}
                                className="px-6 py-2.5 text-[12px] font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex items-center gap-2 bg-primary text-on-primary px-8 py-2.5 rounded-lg text-[12px] font-label-md hover:bg-primary-dim hover:shadow-md transition-all active:scale-95 group"
                              >
                                Submit Claim
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Contextual Helper (Right Column) */}
                        <div className="lg:col-span-4 mt-6 lg:mt-0">
                          <div className="bg-surface-container-highest rounded-xl p-6 border border-tertiary-fixed/40 shadow-sm relative overflow-hidden group">
                            {/* Top Accent Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-tertiary-fixed"></div>
                            <div className="flex items-center gap-3 mb-4 mt-2">
                              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                                <Lightbulb className="h-5 w-5" fill="currentColor" />
                              </div>
                              <h3 className="text-[18px] font-headline-md font-semibold text-on-surface">Tips for a Strong Claim</h3>
                            </div>
                            <ul className="space-y-4 mt-6">
                              <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-tertiary-dim mt-0.5 shrink-0" />
                                <div>
                                  <strong className="block text-[12px] font-label-md text-on-surface">Be Specific</strong>
                                  <span className="text-[14px] font-body-md text-on-surface-variant">Mention unique marks, exact brand names, or highly specific contents.</span>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-tertiary-dim mt-0.5 shrink-0" />
                                <div>
                                  <strong className="block text-[12px] font-label-md text-on-surface">Provide Context</strong>
                                  <span className="text-[14px] font-body-md text-on-surface-variant">If relevant to the question, describe exactly where or when the item was lost.</span>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-tertiary-dim mt-0.5 shrink-0" />
                                <div>
                                  <strong className="block text-[12px] font-label-md text-on-surface">Be Patient</strong>
                                  <span className="text-[14px] font-body-md text-on-surface-variant">Finders are community volunteers; review times may vary based on their availability.</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>
{/* PANEL: NOTIFICATIONS & ALERTS */}
            <section
              id="notifications"
              className={`${activeTab === "notifications" ? "block" : "hidden"} flex-1 flex flex-col min-w-0`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32 max-w-5xl mx-auto w-full">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h2 className="font-headline-lg text-3xl font-bold text-on-background mb-2">Alerts & Notifications</h2>
                    <p className="font-body-md text-on-surface-variant">Stay updated on your reported items and community activity.</p>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    <button 
                      onClick={() => markAllAlertsRead()}
                      className="px-4 py-2 rounded-full border border-outline-variant font-label-md text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                    >
                      Mark all read
                    </button>
                    <button className="px-4 py-2 rounded-full border border-outline-variant font-label-md text-sm text-on-surface-variant hover:bg-surface-variant transition-colors flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Bento Grid Layout for Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* High Priority Alert - Spans full width on mobile, 8 cols on desktop */}
                  <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 left-0 w-1 h-full bg-error-container"></div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center flex-shrink-0 text-error-container">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-headline-md text-lg text-on-background">Community Safety Alert</h3>
                          <span className="font-label-md text-xs text-on-surface-variant whitespace-nowrap ml-2">Just now</span>
                        </div>
                        <p className="font-body-md text-on-surface mb-3">Increase in reported lost keys in the Downtown Business District. Please ensure your belongings are secure.</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-variant text-on-surface-variant font-label-md text-[10px] uppercase tracking-wider">Announcement</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stat / Summary Card */}
                  <div className="md:col-span-4 bg-primary text-on-primary rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                      <Bell className="w-[120px] h-[120px]" />
                    </div>
                    <div>
                      <h3 className="font-headline-md text-lg text-on-primary mb-1">Unread Alerts</h3>
                      <p className="font-body-md text-primary-fixed-dim opacity-90">You have new activity</p>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-headline-lg text-5xl font-bold leading-none">{notifications.filter(n => !n.read).length}</span>
                      <span className="font-body-md opacity-90">Pending reviews</span>
                    </div>
                  </div>

                  {notifications.map((notif) => {
                    const isUnread = !notif.read;
                    const isMatch = notif.message.toLowerCase().includes("match");
                    const isClaim = notif.message.toLowerCase().includes("claim");
                    
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => markAlertRead(notif.id)}
                        className={`md:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow relative cursor-pointer ${!isUnread ? "opacity-80" : ""}`}
                      >
                        {isUnread && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary"></div>}
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isMatch ? "bg-primary-container text-on-primary-container" : 
                            isClaim ? "bg-secondary-container text-on-secondary-container" : 
                            "bg-surface-variant text-on-surface-variant"
                          }`}>
                            {isMatch ? <Search className="h-6 w-6" /> : isClaim ? <CheckCircle2 className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-headline-md text-lg text-on-background">
                                {isMatch ? "Potential Match Found!" : isClaim ? "Item Claimed" : "New Message"}
                              </h3>
                              <span className="font-label-md text-xs text-on-surface-variant">
                                {notif.timestamp ? new Date(notif.timestamp.seconds ? notif.timestamp.seconds * 1000 : notif.timestamp).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                            <p className="font-body-md text-sm text-on-surface mb-3 line-clamp-2">{notif.message}</p>
                            
                            {isMatch && (
                              <div className="bg-surface-container rounded-lg p-3 flex items-center gap-3 mt-2">
                                <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-outline" />
                                </div>
                                <div>
                                  <p className="font-label-md text-xs font-bold text-on-surface">Review Match</p>
                                  <p className="font-label-md text-[10px] text-on-surface-variant">Tap to view details</p>
                                </div>
                                <button className="ml-auto text-primary hover:bg-surface-variant p-2 rounded-full transition-colors">
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            
                            {isClaim && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed font-label-md text-[11px]">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Closed
                                </span>
                                <button onClick={() => { if (notif.itemId) { setSelectedItemId(notif.itemId); setActiveTab("itemDetail"); } }} className="text-secondary hover:underline font-label-md text-sm">View details</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {notifications.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant">
                        <Bell className="h-8 w-8 text-outline" />
                      </div>
                      <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">You're all caught up</h3>
                      <p className="font-body-md text-on-surface-variant">There are no new notifications or alerts at this time.</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <button className="px-6 py-2 rounded-full bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors font-label-md text-sm shadow-sm">
                      Load Older Alerts
                    </button>
                  </div>
                )}
              </div>
            </section>

{/* PANEL: PROFILE */}
            <section
              id="profile"
              className={`${activeTab === "profile" ? "block" : "hidden"} flex-1 flex flex-col min-w-0`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32 max-w-7xl mx-auto w-full space-y-8">
                {/* Mobile Menu Toggle header would be here, but we are inside the main canvas */}
                <h2 className="font-headline-sm text-3xl font-bold text-on-surface mb-8 hidden md:block">Profile Overview</h2>
                
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Profile Header Card (Hero) */}
                  <div className="col-span-1 lg:col-span-12 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent pointer-events-none"></div>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                      {/* Avatar Container with 'Level' Ring */}
                      <div className="relative group cursor-pointer shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-tertiary-container shadow-md overflow-hidden relative bg-surface-variant flex items-center justify-center text-4xl font-bold text-on-surface-variant">
                          {profileName.charAt(0).toUpperCase()}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        {/* Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-tertiary text-on-tertiary px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-surface-container-lowest">
                          <Star className="h-4 w-4" fill="currentColor" />
                          <span className="font-label-md text-[10px] uppercase font-bold tracking-wider">Level {Math.max(1, Math.floor(items.filter(i => i.userId === auth.currentUser?.uid).length / 5))}</span>
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 text-center md:text-left mt-4 md:mt-0 w-full">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <h1 className="font-headline-lg text-4xl text-on-surface">{profileName}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-sm font-semibold inline-flex items-center gap-1">
                                <Heart className="h-4 w-4" fill="currentColor" />
                                Community Member
                              </span>
                              <span className="text-on-surface-variant font-body-md flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {profileLocation || "Location not set"}
                              </span>
                            </div>
                            <p className="mt-4 font-body-md text-on-surface-variant max-w-2xl">
                              {profileBio || "Update your profile to add a bio."}
                            </p>
                          </div>
                          <button onClick={() => document.getElementById("profName")?.focus()} className="bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-variant px-4 py-2 rounded-lg font-label-md text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 w-full md:w-auto">
                            <Settings className="h-[18px] w-[18px]" />
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6 flex-1 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4 text-primary">
                        <div className="bg-primary-container p-2 rounded-lg">
                          <Package className="h-5 w-5 text-on-primary-container" />
                        </div>
                        <h3 className="font-headline-md text-lg font-semibold">Impact Stats</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-surface-container rounded-lg p-4 text-center">
                          <span className="block font-headline-lg text-primary text-3xl mb-1">{items.filter(i => i.userId === auth.currentUser?.uid).length}</span>
                          <span className="font-label-md text-on-surface-variant uppercase tracking-wide text-[10px]">Items Reported</span>
                        </div>
                        <div className="bg-surface-container rounded-lg p-4 text-center">
                          <span className="block font-headline-lg text-secondary text-3xl mb-1">{items.filter(i => i.userId === auth.currentUser?.uid && i.claimed).length}</span>
                          <span className="font-label-md text-on-surface-variant uppercase tracking-wide text-[10px]">Reunited</span>
                        </div>
                        
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Form */}
                  <div className="col-span-1 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6 md:p-8">
                    <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-surface-variant pb-4">Personal Information</h3>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); triggerToast("Profile updated successfully", "success"); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Group */}
                        <div>
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profName">Display Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-outline" />
                            </div>
                            <input 
                              className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profName" 
                              type="text" 
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profBio">Bio</label>
                          <textarea 
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                            id="profBio" 
                            rows={3}
                            placeholder="Tell the community a bit about yourself..."
                            value={profileBio}
                            onChange={(e) => setProfileBio(e.target.value)}
                          ></textarea>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profEmail">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-outline" />
                            </div>
                            <input 
                              className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface opacity-70 cursor-not-allowed font-body-md" 
                              id="profEmail" 
                              type="email" 
                              value={profileEmail || "No email"}
                              disabled
                            />
                          </div>
                          {auth.currentUser?.emailVerified && (
                            <p className="text-xs text-on-surface-variant mt-1 ml-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              Email verified
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profPhone">Phone Number</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-outline font-body-md">+</span>
                            </div>
                            <input 
                              className="pl-8 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profPhone" 
                              type="tel" 
                              value={profileContact}
                              onChange={(e) => setProfileContact(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profLoc">Primary Location</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin className="h-5 w-5 text-outline" />
                            </div>
                            <input 
                              className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profLoc" 
                              type="text" 
                              value={profileLocation}
                              onChange={(e) => setProfileLocation(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button 
                          className="bg-primary hover:bg-primary-dim text-on-primary font-label-md text-sm py-2.5 px-6 rounded-lg shadow-sm transition-colors" 
                          type="submit"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Settings & Preferences */}
                  <div className="col-span-1 lg:col-span-12 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-variant">
                      {/* Notifications */}
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 text-on-surface">
                          <div className="bg-secondary-container p-2 rounded-lg">
                            <Bell className="h-5 w-5 text-on-secondary-container" />
                          </div>
                          <h3 className="font-headline-md text-lg font-semibold">Notification Preferences</h3>
                        </div>
                        <div className="space-y-5">
                          <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                              <span className="font-body-md text-on-surface font-medium block">New matches for my items</span>
                              <span className="font-body-md text-xs text-on-surface-variant">Get notified when a found item matches your report.</span>
                            </div>
                            <div className="relative">
                              <input defaultChecked className="sr-only peer" type="checkbox" />
                              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                              <span className="font-body-md text-on-surface font-medium block">Community Alerts</span>
                              <span className="font-body-md text-xs text-on-surface-variant">Important alerts in your primary location.</span>
                            </div>
                            <div className="relative">
                              <input defaultChecked className="sr-only peer" type="checkbox" />
                              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      {/* Security */}
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 text-on-surface">
                          <div className="bg-surface-variant p-2 rounded-lg">
                            <Lock className="h-5 w-5 text-on-surface-variant" />
                          </div>
                          <h3 className="font-headline-md text-lg font-semibold">Security</h3>
                        </div>
                        <div className="space-y-4">
                          <button onClick={async () => { if (auth.currentUser?.email) { try { const { sendPasswordResetEmail } = await import("firebase/auth"); await sendPasswordResetEmail(auth, auth.currentUser.email); triggerToast("Password reset email sent", "success"); } catch (e) { triggerToast("Failed to send reset email", "error"); } } else { triggerToast("No email associated with account", "error"); } }} className="w-full flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors group">
                            <div className="flex items-center gap-3 text-left">
                              <Key className="h-5 w-5 text-on-surface-variant" />
                              <div>
                                <span className="block font-body-md font-medium text-on-surface">Change Password</span>
                                <span className="block text-xs text-on-surface-variant mt-0.5">Update your security credentials</span>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                          </button>
                          
                          <div className="pt-4 mt-4 border-t border-surface-variant">
                            <button 
                              onClick={logOut}
                              className="text-error hover:text-error-dim font-label-md text-sm flex items-center gap-2 transition-colors w-full p-2"
                            >
                              <LogOut className="h-5 w-5" />
                              Sign Out Everywhere
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
{/* PANEL: MY ITEMS */}
            <section
              id="myitems"
              className={`${activeTab === "myitems" ? "block" : "hidden"} `}
            >
              <div className="p-4 md:p-8">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                  <div>
                    <h2 className="font-headline-lg text-3xl font-bold text-on-background mb-1">My Items</h2>
                    <p className="font-body-lg text-on-surface-variant">Manage and track your reported lost or found items.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("report")}
                    className="flex items-center gap-2 px-4 py-2 font-label-md font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-dim transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" /> Report New
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-8 border-b border-outline-variant mb-8 overflow-x-auto pb-px">
                  <button className="font-label-md text-sm text-primary border-b-2 border-primary pb-3 px-1 whitespace-nowrap">
                    Active ({items.filter(i => i.userId === auth.currentUser?.uid && !i.claimed).length})
                  </button>
                  <button className="font-label-md text-sm text-on-surface-variant hover:text-primary transition-colors pb-3 px-1 whitespace-nowrap">
                    Resolved ({items.filter(i => i.userId === auth.currentUser?.uid && i.claimed).length})
                  </button>
                </div>

                {/* Bento Grid List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items
                    .filter((item) => item.userId === auth.currentUser?.uid)
                    .map((r) => {
                      return (
                        <article key={r.id} className="bg-surface-container-lowest rounded-[16px] p-4 md:p-6 shadow-[0_4px_24px_rgba(1,114,90,0.08)] hover:shadow-[0_8px_32px_rgba(1,114,90,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full border border-surface-variant group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2">
                              {r.claimed ? (
                                <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center space-x-1">
                                  <CheckCircle2 className="h-[14px] w-[14px]" />
                                  <span>Match Found</span>
                                </span>
                              ) : r.type === "found" ? (
                                <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center space-x-1">
                                  <Hand className="h-[14px] w-[14px]" />
                                  <span>Found</span>
                                </span>
                              ) : (
                                <span className="bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center space-x-1">
                                  <Search className="h-[14px] w-[14px] animate-pulse" />
                                  <span>Searching</span>
                                </span>
                              )}
                              <span className="text-on-surface-variant font-label-md text-xs">
                                {r.type === 'found' ? 'Found' : 'Lost'} • {r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <button 
                              onClick={() => deleteItem(r.id)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div 
                            className="flex space-x-4 mb-4 flex-1 cursor-pointer"
                            onClick={() => {
                              setSelectedItemId(r.id);
                              setActiveTab("itemDetail");
                            }}
                          >
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center text-outline-variant">
                              {r.image || r.imageUrl ? (
                                <img src={r.image || r.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon className="h-10 w-10 opacity-30" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {r.title}
                              </h3>
                              <div className="flex items-center space-x-1 mt-2 text-primary">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="font-label-md text-[11px] truncate">{r.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-outline-variant flex space-x-3 mt-auto">
                            {r.claimed ? (
                              <>
                                <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label-md text-sm hover:bg-primary-dim transition-colors flex items-center justify-center space-x-2">
                                  <MessageSquare className="h-[18px] w-[18px]" />
                                  <span>Message Finder</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setSelectedItemId(r.id);
                                    setActiveTab("itemDetail");
                                  }}
                                  className="flex-1 border border-primary text-primary py-2 rounded-lg font-label-md text-sm hover:bg-surface-container transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Eye className="h-[18px] w-[18px]" />
                                  <span>View Details</span>
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  
                  {items.filter((item) => item.userId === auth.currentUser?.uid).length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                      <Inbox className="h-12 w-12 text-outline mx-auto mb-4" />
                      <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No items yet</h3>
                      <p className="font-body-md text-on-surface-variant mb-6">You haven't reported any lost or found items.</p>
                      <button 
                        onClick={() => setActiveTab("report")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 font-label-md font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-dim transition-colors"
                      >
                        <PlusCircle className="h-4 w-4" /> Report an Item
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
{/* PANEL: PINNED ITEMS */}
            <section
              id="pinned"
              className={`${activeTab === "pinned" ? "block" : "hidden"} flex-1 flex flex-col min-w-0`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h2 className="font-headline-lg text-3xl font-bold text-on-background mb-2">Pinned Items</h2>
                    <p className="font-body-lg text-on-surface-variant max-w-2xl">Keep track of important community reports. Items you pin will appear here for quick access until they are resolved or you unpin them.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-surface-container rounded-lg font-label-md text-sm text-on-surface flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-outline-variant">
                      <Filter className="h-[18px] w-[18px]" />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-surface-container rounded-lg font-label-md text-sm text-on-surface flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-outline-variant">
                      <ArrowDownUp className="h-[18px] w-[18px]" />
                      Sort
                    </button>
                  </div>
                </div>

                {/* Bento Grid for Pinned Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items
                    .filter((item) => pinnedIds.includes(item.id))
                    .map((r, i) => {
                      const isLarge = i % 5 === 0;
                      return (
                        <div 
                          key={r.id} 
                          className={`${isLarge ? "md:col-span-2 lg:col-span-2 row-span-2" : "col-span-1 row-span-1"} bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_-4px_rgba(1,114,90,0.08)] border border-outline-variant/30 overflow-hidden flex flex-col group relative transition-transform hover:-translate-y-1 duration-300 cursor-pointer`}
                          onClick={() => {
                            setSelectedItemId(r.id);
                            setActiveTab("itemDetail");
                          }}
                        >
                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <span className={`${r.claimed ? 'bg-secondary-container text-on-secondary-container' : r.type === 'found' ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'} px-3 py-1 rounded-full font-label-md text-[10px] font-bold tracking-wider uppercase shadow-sm`}>
                              {r.claimed ? "Resolved" : r.type === "found" ? "Found" : "Lost"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(r.id);
                              }}
                              className="bg-surface-container-lowest/80 backdrop-blur p-2 rounded-full text-primary hover:text-error transition-colors shadow-sm group/btn"
                              title="Unpin Item"
                            >
                              <MapPin className="h-4 w-4 fill-current group-hover/btn:hidden" />
                              <X className="h-4 w-4 hidden group-hover/btn:block text-error" />
                            </button>
                          </div>
                          
                          <div className={`${isLarge ? "h-64" : "h-48"} relative w-full overflow-hidden bg-surface-variant flex items-center justify-center`}>
                            {r.image || r.imageUrl ? (
                              <>
                                <img
                                  src={r.image || r.imageUrl}
                                  alt={r.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  referrerPolicy="no-referrer"
                                />
                                {isLarge && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>}
                              </>
                            ) : (
                              <div className="w-full h-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline-variant p-4 m-4 rounded-lg bg-surface-container-lowest">
                                <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                <span className="font-label-md text-xs text-center opacity-70">No Image Available</span>
                              </div>
                            )}
                            
                            {isLarge && (r.image || r.imageUrl) && (
                              <div className="absolute bottom-4 left-4 right-4 text-white">
                                <div className="flex items-center gap-2 mb-1 text-sm opacity-90">
                                  <MapPin className="h-[16px] w-[16px]" />
                                  <span>{r.location || "Unknown"}</span>
                                </div>
                                <h3 className="font-headline-md text-2xl font-bold leading-tight line-clamp-1">{r.title}</h3>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col">
                            {(!isLarge || (!r.image && !r.imageUrl)) && (
                              <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-1 line-clamp-1 group-hover:text-primary transition-colors">{r.title}</h3>
                            )}
                            
                            {(!isLarge || (!r.image && !r.imageUrl)) && (
                              <div className="flex items-center gap-1 text-on-surface-variant text-sm mb-3">
                                <MapPin className="h-[14px] w-[14px] text-primary" />
                                <span className="truncate">{r.location || "Unknown"}</span>
                              </div>
                            )}
                            
                            <p className="font-body-md text-on-surface-variant line-clamp-3 mb-4 text-sm">
                              {r.desc || r.description || "No description provided."}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-surface-variant flex justify-between items-center">
                              {isLarge ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-xs font-bold text-on-surface">
                                    {r.contactName ? r.contactName.charAt(0).toUpperCase() : "U"}
                                  </div>
                                  <span className="font-label-md text-xs text-on-surface">Reported by {r.contactName || "User"}</span>
                                </div>
                              ) : (
                                <span className="font-label-md text-xs text-outline flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Pinned {r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                              )}
                              
                              <button className="text-primary font-label-md text-sm hover:underline flex items-center gap-1">
                                View Details {isLarge && <ArrowRight className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  {items.filter((item) => pinnedIds.includes(item.id)).length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant">
                        <MapPin className="h-8 w-8 text-outline" />
                      </div>
                      <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No pinned items</h3>
                      <p className="font-body-md text-on-surface-variant mb-6">You haven't bookmarked any items yet.</p>
                      <button 
                        onClick={() => setActiveTab("search")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 font-label-md font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-dim transition-colors"
                      >
                        <Search className="h-4 w-4" /> Browse Items
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
{/* PANEL: CATEGORIES BROWSER */}
            <section
              id="categories"
              className={`${activeTab === "categories" ? "block" : "hidden"} flex-1 flex flex-col min-w-0`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32 max-w-7xl mx-auto w-full">
                {/* Page Header */}
                <div className="mb-12">
                  <h2 className="font-headline-lg text-4xl font-bold text-primary mb-2">Browse Categories</h2>
                  <p className="font-body-lg text-on-surface-variant max-w-2xl">Find what you're looking for by exploring our organized categories. We've classified items to help you navigate through reports efficiently.</p>
                </div>
                
                {/* Bento Grid for Categories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
                  {/* Electronics (Large Featured) */}
                  <div 
                    className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-8 flex flex-col justify-between group overflow-hidden relative border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["phone", "laptop", "tablet", "charger", "headphone", "earphone", "computer", "iphone", "samsung", "ipad", "macbook"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                      <Smartphone className="w-[300px] h-[300px] text-primary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-primary-container p-3 rounded-lg inline-flex">
                        <Smartphone className="text-on-primary-container h-8 w-8" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-xs px-3 py-1 rounded-full border border-outline-variant/20">
                        {items.filter(i => ["phone", "laptop", "tablet", "charger", "headphone", "earphone", "computer", "iphone", "samsung", "ipad", "macbook"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-headline-md text-3xl font-bold text-primary mb-2 group-hover:text-primary-dim transition-colors">Electronics</h3>
                      <p className="font-body-md text-base text-on-surface-variant max-w-sm">Phones, laptops, tablets, and other digital devices reported lost or found recently.</p>
                    </div>
                  </div>

                  {/* Bags & Luggage */}
                  <div 
                    className="col-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["bag", "backpack", "purse", "wallet", "luggage", "suitcase", "handbag"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                      <Package className="w-[150px] h-[150px] text-tertiary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-tertiary-container p-2 rounded-lg inline-flex">
                        <Package className="text-on-tertiary-container h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["bag", "backpack", "purse", "wallet", "luggage", "suitcase", "handbag"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-tertiary transition-colors">Bags & Luggage</h3>
                      <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">Backpacks, purses, suitcases and other carry-ons.</p>
                    </div>
                  </div>

                  {/* Pets */}
                  <div 
                    className="col-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["dog", "cat", "pet", "bird", "animal", "puppy", "kitten", "collar"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                      <Heart className="w-[150px] h-[150px] text-error" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-[#ffdcdc] p-2 rounded-lg inline-flex">
                        <Heart className="text-error h-6 w-6" fill="currentColor" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["dog", "cat", "pet", "bird", "animal", "puppy", "kitten", "collar"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-error transition-colors">Pets & Animals</h3>
                      <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">Lost dogs, cats, and other companion animals.</p>
                    </div>
                  </div>

                  {/* Documents (Tall) */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-2 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["document", "id", "passport", "license", "card", "paper", "folder"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                      <div className="bg-secondary-container p-3 rounded-lg inline-flex">
                        <FileText className="text-on-secondary-container h-8 w-8" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["document", "id", "passport", "license", "card", "paper", "folder"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-2xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">Documents & IDs</h3>
                      <p className="font-body-md text-sm text-on-surface-variant mb-4">Passports, driver's licenses, IDs, and important paperwork.</p>
                      <div className="flex items-center text-primary font-label-md text-xs group-hover:translate-x-1 transition-transform">
                        Explore <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Clothing */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["jacket", "shirt", "pants", "uniform", "shoes", "hat", "scarf", "coat", "clothing"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-surface-variant p-2 rounded-lg inline-flex">
                        <Tag className="text-on-surface h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["jacket", "shirt", "pants", "uniform", "shoes", "hat", "scarf", "coat", "clothing"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Clothing</h3>
                    </div>
                  </div>

                  {/* Jewelry & Watches */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["ring", "necklace", "bracelet", "watch", "earring", "jewelry", "diamond", "gold", "silver"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-surface-variant p-2 rounded-lg inline-flex">
                        <Clock className="text-on-surface h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["ring", "necklace", "bracelet", "watch", "earring", "jewelry", "diamond", "gold", "silver"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Jewelry & Watches</h3>
                    </div>
                  </div>

                  {/* Keys */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["key", "keychain", "fob", "car key"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-surface-variant p-2 rounded-lg inline-flex">
                        <Key className="text-on-surface h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["key", "keychain", "fob", "car key"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Keys</h3>
                    </div>
                  </div>
                </div>
              </div>
            </section>
{/* PANEL: ANALYTICS DESK */}
            <section
              id="analytics"
              className={`panel ${activeTab === "analytics" ? "active" : ""}`}
            >
              {/* Header */}
              <div className="flex flex-col gap-1 mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold tracking-tight text-[#01725a] font-sans flex items-center gap-2">
                  <BarChart2 className="h-6 w-6 text-[#01725a]" /> Analytics Dashboard
                </h2>
                <p className="text-sm text-gray-500">
                  Real-time visual metrics and recovery performance of reported items from Firestore.
                </p>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Lost Reports</span>
                    <span className="p-2 rounded-xl bg-red-50 text-red-500">
                      <Archive className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-gray-800 tracking-tight font-sans">
                      {stats.lost}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span className="font-semibold text-red-500">Currently active</span> lost items
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Found Reports</span>
                    <span className="p-2 rounded-xl bg-sky-50 text-sky-500">
                      <Search className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-gray-800 tracking-tight font-sans">
                      {stats.found}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span className="font-semibold text-sky-500">Awaiting claim</span> validation
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resolved Cases</span>
                    <span className="p-2 rounded-xl bg-[#9af4d6]/50 text-[#00654f]">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-gray-800 tracking-tight font-sans">
                      {stats.claimed}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span className="font-semibold text-emerald-600">Reunited</span> with rightful owners
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Success Rate</span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-500">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-gray-800 tracking-tight font-sans">
                      {items.length > 0 ? Math.round((stats.claimed / items.length) * 100) : 0}%
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span className="font-semibold text-amber-600">
                        {items.length > 0 && Math.round((stats.claimed / items.length) * 100) >= 50 ? "High performance" : "Steady growth"}
                      </span>{" "}
                      across {items.length} total reports
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Chart 1: Recovery Trends (Col-span 2) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm tracking-tight font-sans uppercase">Recovery Trends</h3>
                      <p className="text-xs text-gray-400">Monthly breakdown of reported vs resolved items</p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#9af4d6] rounded"></span>
                        <span className="text-gray-500">Reported</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#01725a] rounded"></span>
                        <span className="text-gray-500">Resolved</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Bar Chart */}
                  <div className="w-full h-64 flex flex-col mt-4">
                    <div className="flex-1 flex items-end gap-2 sm:gap-4 relative pt-6 border-b border-gray-100 pb-2 h-48">
                      {/* Y-Axis Labels */}
                      <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-gray-400 font-medium select-none pointer-events-none">
                        <span>{maxChartValue}</span>
                        <span>{Math.round(maxChartValue * 0.75)}</span>
                        <span>{Math.round(maxChartValue * 0.5)}</span>
                        <span>{Math.round(maxChartValue * 0.25)}</span>
                        <span>0</span>
                      </div>

                      {/* Chart Bars Grid */}
                      <div className="flex-1 flex items-end justify-between ml-10 h-full relative">
                        {/* Horizontal Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                          <div className="w-full border-t border-gray-50"></div>
                          <div className="w-full border-t border-gray-50"></div>
                          <div className="w-full border-t border-gray-50"></div>
                          <div className="w-full border-t border-gray-50"></div>
                          <div className="w-full border-t border-gray-50"></div>
                        </div>

                        {/* Month Bars */}
                        {monthlyStats.map((m, idx) => {
                          const reportedHeight = maxChartValue > 0 ? (m.reported / maxChartValue) * 80 : 0;
                          const resolvedHeight = maxChartValue > 0 ? (m.resolved / maxChartValue) * 80 : 0;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 z-10 w-full group">
                              <div className="flex items-end justify-center gap-1 sm:gap-1.5 w-full h-40">
                                {/* Reported Bar */}
                                <div
                                  className="w-3 sm:w-5 bg-[#9af4d6] rounded-t-sm relative hover:bg-[#83ebd0] transition-all duration-300 shadow-sm"
                                  style={{ height: `${Math.max(reportedHeight, 2)}%` }}
                                >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap pointer-events-none">
                                    Reported: {m.reported}
                                  </div>
                                </div>
                                {/* Resolved Bar */}
                                <div
                                  className="w-3 sm:w-5 bg-[#01725a] rounded-t-sm relative hover:bg-[#00654f] transition-all duration-300 shadow-sm"
                                  style={{ height: `${Math.max(resolvedHeight, 2)}%` }}
                                >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap pointer-events-none">
                                    Resolved: {m.resolved}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-medium text-gray-400">{m.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Categories (Col-span 1) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm tracking-tight font-sans uppercase mb-1">Categories</h3>
                    <p className="text-xs text-gray-400 mb-4">Distribution by matched keywords</p>
                  </div>

                  {/* SVG Donut */}
                  <div className="flex-1 flex flex-col justify-center">
                    {(() => {
                      const activeCategories = categoryStats.filter((c) => c.count > 0);
                      if (activeCategories.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                            <span className="text-4xl mb-2">📊</span>
                            <p className="text-xs text-gray-400">No reported data yet</p>
                          </div>
                        );
                      }

                      const radius = 45;
                      const strokeWidth = 10;
                      const circumference = 2 * Math.PI * radius;
                      let accumulatedPercentage = 0;

                      return (
                        <div className="relative w-40 h-40 mx-auto mb-4">
                          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            <circle
                              cx="50"
                              cy="50"
                              r={radius}
                              fill="transparent"
                              stroke="#f3f4f6"
                              strokeWidth={strokeWidth}
                            />
                            {categoryStats.map((cat) => {
                              if (cat.count === 0) return null;
                              const strokeLength = (cat.percentage / 100) * circumference;
                              const strokeOffset = circumference - (accumulatedPercentage / 100) * circumference;
                              accumulatedPercentage += cat.percentage;

                              return (
                                <circle
                                  key={cat.name}
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  fill="transparent"
                                  stroke={cat.color}
                                  strokeWidth={strokeWidth}
                                  strokeDasharray={`${strokeLength} ${circumference}`}
                                  strokeDashoffset={strokeOffset}
                                  strokeLinecap="round"
                                  className="transition-all duration-300 hover:stroke-[12px] cursor-pointer"
                                />
                              );
                            })}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-extrabold text-gray-800 font-sans">{items.length}</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Reports</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Scrollable category list legend */}
                    <div className="max-h-24 overflow-y-auto pr-1 flex flex-col gap-1 text-[11px]">
                      {categoryStats.map((cat) => {
                        if (cat.count === 0) return null;
                        return (
                          <div key={cat.name} className="flex items-center justify-between text-gray-500">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                              <span className="truncate">{cat.name}</span>
                            </div>
                            <span className="font-semibold text-gray-700 ml-1 shrink-0">{cat.percentage}% ({cat.count})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table: Top Performing Areas */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm tracking-tight font-sans uppercase">Top Performing Areas</h3>
                    <p className="text-xs text-gray-400">Locations sorted by total database activity</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#9af4d6]/50 text-[#00654f]">
                    Live
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-500 border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase font-semibold">
                        <th className="py-2.5 pb-2">Area / Location</th>
                        <th className="py-2.5 pb-2 text-center">Total Reported</th>
                        <th className="py-2.5 pb-2 text-center">Recovered / Claimed</th>
                        <th className="py-2.5 pb-2 text-center">Success Rate</th>
                        <th className="py-2.5 pb-2 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationStats.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400">
                            No locations reported yet. Submit items on the Report tab to populate statistics!
                          </td>
                        </tr>
                      ) : (
                        locationStats.map((loc, idx) => (
                          <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 font-semibold text-gray-700 flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              {loc.name}
                            </td>
                            <td className="py-3 text-center text-gray-600 font-medium">{loc.total}</td>
                            <td className="py-3 text-center text-gray-600 font-medium">{loc.resolved}</td>
                            <td className="py-3 text-center">
                              <div className="inline-flex items-center gap-1.5 font-bold text-gray-800">
                                <div className="w-12 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-[#01725a] h-full rounded-full"
                                    style={{ width: `${loc.rate}%` }}
                                  ></div>
                                </div>
                                <span>{loc.rate}%</span>
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${loc.trendColor}`}>
                                {loc.trendText}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* PANEL: GENERAL LIST OF INFORMATION GUIDES */}
            <section
              id="tips"
              className={`panel ${activeTab === "tips" ? "active" : ""}`}
            >
              <div className="section-title">
                <Navigation className="h-5 w-5 inline mr-1 text-sky-500" /> Lost
                Item Recovery Guide
              </div>
              <p className="section-subtitle">
                Helpful tips to increase your chances of finding lost items
              </p>
              <div className="tips-grid">
                <div className="tip-card">
                  <Search className="h-5 w-5 text-sky-500 inline mr-1" />{" "}
                  <strong>Retrace Recent Locations</strong>
                  <br />
                  <br />
                  Carefully revisit the places you recently visited to help
                  locate missing items.
                </div>
                <div className="tip-card">
                  <MapPin className="h-5 w-5 text-red-500 inline mr-1" />{" "}
                  <strong>Check Nearby Areas</strong>
                  <br />
                  <br />
                  Inspect public spaces, offices, transportation stops, shops,
                  and common areas.
                </div>
                <div className="tip-card">
                  <Smartphone className="h-5 w-5 text-indigo-500 inline mr-1" />{" "}
                  <strong>Use Digital Tools</strong>
                  <br />
                  <br />
                  Post on forums, use FindTrack, check social media groups.
                </div>
                <div className="tip-card">
                  <CheckCircle2 className="h-5 w-5 text-green-500 inline mr-1" />{" "}
                  <strong>Act Quickly</strong>
                  <br />
                  <br />
                  Report and search within 2 hours for best results.
                </div>
                <div className="tip-card">
                  <Camera className="h-5 w-5 text-amber-500 inline mr-1" />{" "}
                  <strong>Add Photos</strong>
                  <br />
                  <br />
                  Upload a photo of your item for much faster identification.
                </div>
                <div className="tip-card">
                  <Bell className="h-5 w-5 text-pink-500 inline mr-1" />{" "}
                  <strong>Stay Updated</strong>
                  <br />
                  <br />
                  Receive updates and notifications about matched or recovered
                  items.
                </div>
                <div className="tip-card">
                  <PenTool className="h-5 w-5 text-slate-500 inline mr-1" />{" "}
                  <strong>Submit Detailed Reports</strong>
                  <br />
                  <br />
                  Provide accurate descriptions and item details for easier
                  identification.
                </div>
              </div>
            </section>

            <section
              id="packaging"
              className={`panel ${activeTab === "packaging" ? "active" : ""}`}
            >
              <div className="section-title">
                <Package className="h-5 w-5 inline mr-1 text-sky-500" />{" "}
                Packaging &amp; Handling Tips
              </div>
              <p className="section-subtitle">
                Best practices for securing found items
              </p>
              <div className="tips-grid">
                <div className="tip-card">
                  <ShieldCheck className="h-5 w-5 text-teal-500 inline mr-1" />{" "}
                  <strong>Protect Fragile Items</strong>
                  <br />
                  <br />
                  Use bubble wrap or padding for delicate objects.
                </div>
                <div className="tip-card">
                  <Package className="h-5 w-5 text-blue-500 inline mr-1" />{" "}
                  <strong>Seal Securely</strong>
                  <br />
                  <br />
                  Ensure items are properly contained before storage.
                </div>
                <div className="tip-card">
                  <Home className="h-5 w-5 text-indigo-500 inline mr-1" />{" "}
                  <strong>Classify Correctly</strong>
                  <br />
                  <br />
                  Hand keys and sensitive IDs straight to the Library security
                  safe desk.
                </div>
                <div className="tip-card">
                  <CheckCircle2 className="h-5 w-5 text-green-500 inline mr-1" />{" "}
                  <strong>Update Status</strong>
                  <br />
                  <br />
                  Mark items as claimed once they've been recovered.
                </div>
              </div>
            </section>

            <section
              id="about"
              className={`${activeTab === "about" ? "block" : "hidden"}`}
            >
              <div className="max-w-6xl mx-auto space-y-8">
                <header className="mb-8">
                  <h2 className="font-headline-lg text-3xl font-bold text-on-surface">About &amp; Help</h2>
                  <p className="font-body-md text-on-surface-variant mt-2">Everything you need to know about FindTrack.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-8">
                    {/* FAQ */}
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 md:p-8">
                      <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary" /> Frequently Asked Questions
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="border-b border-outline-variant pb-6">
                          <h4 className="font-bold text-on-surface mb-2">How do I verify ownership?</h4>
                          <p className="text-on-surface-variant text-sm">When you claim a found item, you must correctly answer the secret security question set by the finder. Additionally, the finder may request further proof of ownership via contact before handing over the item.</p>
                        </div>
                        <div className="border-b border-outline-variant pb-6">
                          <h4 className="font-bold text-on-surface mb-2">What happens when an item is claimed?</h4>
                          <p className="text-on-surface-variant text-sm">Once an item is successfully claimed and verified, its status changes to 'Resolved'. Contact details are then shared securely between both parties to arrange the return.</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface mb-2">Is FindTrack free to use?</h4>
                          <p className="text-on-surface-variant text-sm">Yes, FindTrack is completely free for all community members. Our mission is to restore trust and reunite lost items with their rightful owners.</p>
                        </div>
                      </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 md:p-8">
                      <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" /> Community Guidelines
                      </h3>
                      <ul className="space-y-3 text-sm text-on-surface-variant">
                        <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Always meet in public, well-lit places when returning items.</li>
                        <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Do not share personal addresses or sensitive information until verified.</li>
                        <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Report any suspicious behavior or false claims immediately.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    {/* Contact Support */}
                    <div className="bg-primary text-on-primary rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="h-8 w-8" />
                        </div>
                        <h3 className="font-headline-md text-xl font-bold mb-2">Need More Help?</h3>
                        <p className="text-sm text-on-primary/90 mb-6">Our support team is ready to assist you with any issues or disputes.</p>
                        <a href="mailto:novapulsarsupport@gmail.com" className="inline-block w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-surface-variant transition-colors shadow-sm">
                          Contact Support
                        </a>
                      </div>
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* App Info */}
                    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 text-center">
                      <div className="w-12 h-12 bg-surface-variant rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">✨</span>
                      </div>
                      <h4 className="font-bold text-on-surface">FindTrack</h4>
                      <p className="text-xs text-on-surface-variant mt-1 mb-4">Version 2.0.0 (Beta)</p>
                      <div className="flex justify-center gap-4 text-xs font-bold text-primary">
                        <button onClick={() => setCurrentView('privacy')}>Privacy Policy</button>
                        <span>&bull;</span>
                        <button onClick={() => setCurrentView('terms')}>Terms of Service</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
</main>

          {/* MOBILE HUD BOTTOM NAV */}
          <nav className="bottom-nav" id="bottomNav">
            <button
              onClick={() => {
                setActiveTab("home");
                setCategoryKeywords(null);
              }}
              className={`bnav-btn ${activeTab === "home" ? "active" : ""}`}
            >
              <span className="bnav-icon">
                <Home className="h-5 w-5" />
              </span>
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab("search");
                setCategoryKeywords(null);
              }}
              className={`bnav-btn ${activeTab === "search" ? "active" : ""}`}
            >
              <span className="bnav-icon">
                <Search className="h-5 w-5" />
              </span>
              Search
            </button>
            <button
              onClick={() => {
                if (profileName === "Guest") {
                  setShowGuestModal(true);
                } else {
                  setActiveTab("notifications");
                }
              }}
              className={`bnav-btn ${activeTab === "notifications" ? "active" : ""}`}
            >
              <span className="bnav-icon">
                <Bell className="h-5 w-5" />
              </span>
              Alerts
            </button>
            <button
              onClick={() => {
                setActiveTab("profile");
              }}
              className={`bnav-btn ${activeTab === "profile" ? "active" : ""}`}
            >
              <span className="bnav-icon">
                <UserIcon className="h-5 w-5" />
              </span>
              Profile
            </button>
          </nav>

          {/* MOBILE REPORT INSTANT FAB */}
          <button
            onClick={() => {
              if (profileName === "Guest") {
                setShowGuestModal(true);
              } else {
                setActiveTab("report");
              }
            }}
            className="report-fab"
            title="Report Item"
          >
            <Package className="h-6 w-6 text-white" />
          </button>
          </div>
        </div>
      )}

      {/* ── ONBOARDING LIGHT OVERLAY DRAWER ── */}
      {showOnboarding && (
        <div className="onboard-overlay">
          <div className="onboard-card" id="onboardCard">
            <div className="onboard-progress" id="onboardProgress">
              {ONBOARD_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`onboard-pip ${idx < onboardStep ? "done" : idx === onboardStep ? "active" : ""}`}
                ></div>
              ))}
            </div>

            <div className="onboard-visual">
              <div className="onboard-icon-wrap" id="onboardIcon">
                {ONBOARD_STEPS[onboardStep].icon}
              </div>
            </div>

            <div className="onboard-body">
              <div className="onboard-step-label" id="onboardLabel">
                {ONBOARD_STEPS[onboardStep].label}
              </div>
              <div className="onboard-title" id="onboardTitle">
                {ONBOARD_STEPS[onboardStep].title}
              </div>
              <div className="onboard-desc" id="onboardDesc">
                {ONBOARD_STEPS[onboardStep].desc}
              </div>

              <div className="onboard-actions">
                <button
                  onClick={() => {
                    if (onboardStep < ONBOARD_STEPS.length - 1) {
                      setOnboardStep((prev) => prev + 1);
                    } else {
                      setShowOnboarding(false);
                      localStorage.setItem("ft_onboarded", "1");
                    }
                  }}
                  className="onboard-next"
                  id="onboardNext"
                >
                  {onboardStep === ONBOARD_STEPS.length - 1
                    ? "Get Started 🚀"
                    : "Next →"}
                </button>
                <button
                  onClick={() => {
                    setShowOnboarding(false);
                    localStorage.setItem("ft_onboarded", "1");
                  }}
                  className="onboard-skip"
                  id="onboardSkip"
                >
                  Skip tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE ZOOM SYSTEM MODAL ── */}
      {zoomImg && (
        <div className="zoom-overlay" onClick={() => setZoomImg(null)}>
          <button className="zoom-close" onClick={() => setZoomImg(null)}>
            ✕
          </button>
          <img src={zoomImg} className="zoom-img" alt="Zoom view" />
          <div className="zoom-hint">Tap anywhere to close</div>
        </div>
      )}

      {/* ── GUEST ACCESS LOCK LOGIN REQUIRED MODAL ── */}
      {showGuestModal && (
        <div
          id="guestModal"
          className="modal"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "guestModal")
              setShowGuestModal(false);
          }}
        >
          <div className="modal-content">
            <div className="modal-icon">🔒</div>
            <h2>Login Required</h2>
            <p>
              Please login or sign up to unlock the full features of FindTrack!
            </p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  setCurrentView("login");
                }}
                className="modal-btn primary"
              >
                <Lock className="h-4 w-4 inline mr-1" /> Login
              </button>
              <button
                onClick={() => {
                  setShowGuestModal(false);
                  setCurrentView("signup");
                }}
                className="modal-btn secondary"
              >
                <UserPlus className="h-4 w-4 inline mr-1" /> Sign Up
              </button>
            </div>
            <button
              onClick={() => setShowGuestModal(false)}
              className="modal-close"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* ── REFERER DOMAIN BLOCKED EXPLANATION MODAL ── */}
      {showRefererModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-[1001] bg-slate-900/60 backdrop-blur-sm"
          style={{ height: '100dvh' }}
        >
          <div className="relative w-full max-w-lg flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[85dvh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-teal-700 to-teal-900 rounded-t-2xl text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-lg font-bold">Domain Security Authorization Required</h3>
              </div>
              <button 
                onClick={() => setShowRefererModal(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed">
              <p className="font-semibold text-slate-900">
                You are visiting FindTrack from a custom domain: <code className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200/50 font-mono">{refererBlockedDomain || window.location.hostname}</code>
              </p>
              
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl text-teal-900 text-left">
                <p className="font-medium mb-1">💡 Quick Fix for Users / Testers:</p>
                <p>If you are a user trying to test FindTrack, please use the official sandbox domain of the app which is pre-authorized and works perfectly:</p>
                <a 
                  href="https://ais-pre-ugza3g3lajlvapecr5xph7-125820164386.asia-east1.run.app" 
                  className="font-semibold underline block mt-1 hover:text-teal-700 font-mono break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://ais-pre-ugza3g3lajlvapecr5xph7-125820164386.asia-east1.run.app
                </a>
              </div>

              <div className="space-y-4 text-left">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs">
                  <p className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-amber-950">
                    <span>📧</span> Fix "Link expired or already used" email verification error:
                  </p>
                  <p className="mb-2 leading-relaxed">
                    If you successfully got the verification email, but clicking the link immediately shows <strong>"Your request to verify your email has expired or the link has already been used"</strong>:
                  </p>
                  <p className="mb-2 leading-relaxed font-semibold text-amber-950">
                    This is caused by restricting your Google Cloud API Key to your custom domain without also authorizing Firebase's default handler domains!
                  </p>
                  <p className="mb-1 leading-relaxed">To resolve this:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-amber-950">Google Cloud Credentials Console</a>.</li>
                    <li>Click your <strong>Browser/Web API Key</strong> to edit its settings.</li>
                    <li>In the <strong>HTTP Referrers (Website restrictions)</strong> list, you must add these three entries:
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[11px] bg-amber-100/50 p-2 rounded">
                        <li><code>https://findtrack-17dee.firebaseapp.com/*</code> (Your Firebase Domain)</li>
                        <li><code>https://findtrack-17dee.web.app/*</code> (Your Firebase Domain)</li>
                        <li><code>https://{window.location.hostname}/*</code> (Your Custom Domain)</li>
                      </ul>
                    </li>
                    <li>Save settings. It may take 1-2 minutes for Google Cloud to apply the updated key restrictions.</li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold text-slate-900">🛠️ General Domain Setup (For Signup Block):</p>
                  <p className="text-xs text-slate-500 mb-2">If you cannot register or login because the domain is blocked:</p>
                  
                  <ol className="list-decimal pl-5 space-y-2 text-xs">
                    <li>
                      Go to the <strong><a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-semibold underline hover:text-teal-800">Firebase Console</a></strong> and select your project.
                    </li>
                    <li>
                      In the sidebar, go to <strong>Authentication</strong>, then click the <strong>Settings</strong> tab.
                    </li>
                    <li>
                      In the left settings list, click <strong>Authorized Domains</strong>.
                    </li>
                    <li>
                      Click <strong>Add domain</strong> and enter: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{refererBlockedDomain || window.location.hostname}</code>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 rounded-b-2xl">
              <button
                onClick={() => setShowRefererModal(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors text-xs"
              >
                Close & Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REAL-TIME DIRECT MESSAGING DRAWER OVERLAY ── */}
      {activeChatId && (
        <ChatInterface
          activeChatId={activeChatId}
          currentUserUid={user ? user.uid : null}
          onClose={() => setActiveChatId(null)}
          onSelectChat={(id) => setActiveChatId(id)}
        />
      )}
    </div>
  );
}

// Cognitive calculation helper utility for similarity matching metrics
function computeMatchScore(a: any, b: any) {
  if (a.type === b.type) return 0;
  if (a.claimed || b.claimed) return 0;

  const textA =
    `${a.title} ${a.desc || a.description || ""} ${a.location}`.toLowerCase();
  const textB =
    `${b.title} ${b.desc || b.description || ""} ${b.location}`.toLowerCase();

  const stopWords = new Set([
    "a",
    "an",
    "the",
    "my",
    "i",
    "is",
    "at",
    "in",
    "on",
    "of",
    "and",
    "or",
    "was",
    "it",
    "this",
    "that",
    "with",
    "for",
    "to",
  ]);
  const tokenise = (t: string) =>
    t
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

  const tA = new Set(tokenise(textA));
  const tB = new Set(tokenise(textB));
  if (tA.size === 0 || tB.size === 0) return 0;

  let shared = 0;
  tA.forEach((w) => {
    if (tB.has(w)) shared++;
  });

  // Jaccard similarity
  const union = new Set([...Array.from(tA), ...Array.from(tB)]).size;
  const jaccard = shared / union;

  // Location bonus
  const locA = (a.location || "").toLowerCase();
  const locB = (b.location || "").toLowerCase();
  const locBonus =
    locA &&
    locB &&
    (locA.includes(locB.slice(0, 5)) || locB.includes(locA.slice(0, 5)))
      ? 0.15
      : 0;

  return Math.min(1, jaccard + locBonus);
}
