import React, { useMemo, useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Star, 
  Trophy, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Flame, 
  HelpCircle,
  TrendingUp,
  Users,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

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

interface LevelRoadmapProps {
  items: ItemReport[];
  userId: string | undefined;
  profileName: string;
  profileLocation: string;
  profileBio: string;
  onBack: () => void;
}

export const LevelRoadmap: React.FC<LevelRoadmapProps> = ({
  items,
  userId,
  profileName,
  profileLocation,
  profileBio,
  onBack
}) => {
  const { t } = useTranslation();
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  // Level thresholds
  // Level 1: Novice Finder (0 - 44 pts)
  // Level 2: Vigilant Citizen (45 - 119 pts)
  // Level 3: Community Guardian (120 - 249 pts)
  // Level 4: Beacon of Hope (250 - 499 pts)
  // Level 5: FindTrack Legend (500+ pts)
  const levels = useMemo(() => [
    { level: 1, name: t("level.rank1", "Novice Finder"), minPoints: 0, maxPoints: 44, badgeColor: "bg-surface-variant border-outline-variant", icon: Star, description: t("level.rank1Desc", "Start your journey. Keep an eye out for missing belongings in your community.") },
    { level: 2, name: t("level.rank2", "Vigilant Citizen"), minPoints: 45, maxPoints: 119, badgeColor: "bg-primary-container border-primary", icon: ShieldCheck, description: t("level.rank2Desc", "Active community reporter. Your reports help restore security and peace of mind.") },
    { level: 3, name: t("level.rank3", "Community Guardian"), minPoints: 120, maxPoints: 249, badgeColor: "bg-secondary-container border-secondary", icon: Heart, description: t("level.rank3Desc", "A pillar of Bayanihan. Generous with effort, you help bridge connections.") },
    { level: 4, name: t("level.rank4", "Beacon of Hope"), minPoints: 250, maxPoints: 499, badgeColor: "bg-tertiary-container/20 border-[#fab83f]/60", icon: Sparkles, description: t("level.rank4Desc", "Extremely reliable. Recognized for your quick eyes and numerous successful returns.") },
    { level: 5, name: t("level.rank5", "FindTrack Legend"), minPoints: 500, maxPoints: Infinity, badgeColor: "bg-tertiary-container/20 border-amber-500", icon: Trophy, description: t("level.rank5Desc", "The ultimate community hero. Revered by the entire community for your integrity.") }
  ], [t]);

  // Subscribe to real-time users collection in Firestore
  useEffect(() => {
    const usersCollection = collection(db, "users");
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDbUsers(list);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users for leaderboard:", error);
      setLoadingUsers(false);
    });

    return unsubscribe;
  }, []);

  // Calculate stats for current logged-in user
  const userItemsCount = useMemo(() => {
    if (!userId) return 0;
    return items.filter((i) => i.userId === userId).length;
  }, [items, userId]);

  const userReunitedCount = useMemo(() => {
    if (!userId) return 0;
    return items.filter((i) => i.userId === userId && i.claimed).length;
  }, [items, userId]);

  // Points mapping: 15 points per report, 50 points per reunited item
  const totalPoints = useMemo(() => {
    return (userItemsCount * 15) + (userReunitedCount * 50);
  }, [userItemsCount, userReunitedCount]);

  // Determine current level and next level info for the logged-in user
  const currentLevelInfo = useMemo(() => {
    const levelObj = levels.find(l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints);
    return levelObj || levels[levels.length - 1];
  }, [totalPoints, levels]);

  const nextLevelInfo = useMemo(() => {
    const currentIndex = levels.findIndex(l => l.level === currentLevelInfo.level);
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return null;
  }, [currentLevelInfo, levels]);

  // Progress percentage toward next level
  const progressPercent = useMemo(() => {
    if (!nextLevelInfo) return 100;
    const currentMin = currentLevelInfo.minPoints;
    const nextMin = nextLevelInfo.minPoints;
    const pointsInCurrentRange = totalPoints - currentMin;
    const rangeTotal = nextMin - currentMin;
    return Math.min(100, Math.max(0, Math.floor((pointsInCurrentRange / rangeTotal) * 100)));
  }, [totalPoints, currentLevelInfo, nextLevelInfo]);

  // Achievements status
  const achievements = useMemo(() => [
    {
      id: "first_spark",
      title: t("level.ach1Title", "First Spark"),
      description: t("level.ach1Desc", "Reported your first lost or found item."),
      criteria: t("level.ach1Crit", "Report 1 item"),
      unlocked: userItemsCount >= 1,
      icon: Flame,
      color: "text-orange-500 bg-orange-50 border-orange-200"
    },
    {
      id: "first_link",
      title: t("level.ach2Title", "First Link"),
      description: t("level.ach2Desc", "Successfully reunited a reported item with its owner."),
      criteria: t("level.ach2Crit", "Reunite 1 item"),
      unlocked: userReunitedCount >= 1,
      icon: Heart,
      color: "text-error bg-red-50 border-red-200"
    },
    {
      id: "bayanihan_champion",
      title: t("level.ach3Title", "Bayanihan Guardian"),
      description: t("level.ach3Desc", "Contributed extensively by reporting multiple items."),
      criteria: t("level.ach3Crit", "Report 5 items"),
      unlocked: userItemsCount >= 5,
      icon: ShieldCheck,
      color: "text-primary bg-primary-container/20 border-primary-container"
    },
    {
      id: "local_savior",
      title: t("level.ach4Title", "Local Savior"),
      description: t("level.ach4Desc", "Returned multiple items safely back to owners."),
      criteria: t("level.ach4Crit", "Reunite 3 items"),
      unlocked: userReunitedCount >= 3,
      icon: Trophy,
      color: "text-amber-600 bg-tertiary-container/10 border-tertiary-container/50"
    },
    {
      id: "profile_ready",
      title: t("level.ach5Title", "Verified Pillar"),
      description: t("level.ach5Desc", "Completed your profile bio and primary location details."),
      criteria: t("level.ach5Crit", "Fill out Bio and Location"),
      unlocked: !!profileLocation && !!profileBio,
      icon: Sparkles,
      color: "text-purple-500 bg-purple-50 border-purple-200"
    }
  ], [userItemsCount, userReunitedCount, profileLocation, profileBio, t]);

  // Construct actual real-time Leaderboard list
  const realLeaderboard = useMemo(() => {
    let list = [...dbUsers];

    // Ensure current user is always in the list even if they haven't synced with Firestore yet
    if (userId) {
      const existsIndex = list.findIndex(u => u.id === userId);
      const currentUserProfile = {
        id: userId,
        name: profileName || "Anonymous User",
        location: profileLocation || "",
        bio: profileBio || "",
        avatar: profileName ? profileName.charAt(0).toUpperCase() : "U"
      };

      if (existsIndex > -1) {
        list[existsIndex] = {
          ...list[existsIndex],
          ...currentUserProfile,
          name: profileName || list[existsIndex].name || list[existsIndex].displayName || "Anonymous User",
          location: profileLocation || list[existsIndex].location || "",
          bio: profileBio || list[existsIndex].bio || ""
        };
      } else {
        list.push(currentUserProfile);
      }
    }

    // Map each user to their dynamic reports and reunited counts using real items data
    const mappedList = list.map((user) => {
      const reports = items.filter((i) => i.userId === user.id).length;
      const reunited = items.filter((i) => i.userId === user.id && i.claimed).length;
      const points = (reports * 15) + (reunited * 50);

      // Level based on total points
      let lvl = 1;
      if (points >= 500) lvl = 5;
      else if (points >= 250) lvl = 4;
      else if (points >= 120) lvl = 3;
      else if (points >= 45) lvl = 2;

      const cleanAvatar = user.avatar && !user.avatar.includes("dicebear.com") && !user.avatar.includes("guest") ? user.avatar : "";

      return {
        id: user.id,
        name: user.name || user.displayName || "Anonymous Finder",
        reports,
        reunited,
        points,
        level: lvl,
        avatar: cleanAvatar || (user.name ? user.name.charAt(0).toUpperCase() : (user.displayName ? user.displayName.charAt(0).toUpperCase() : "U")),
        isCurrentUser: user.id === userId
      };
    });

    // Sort by points, then reports
    return mappedList.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.reports - a.reports;
    });
  }, [dbUsers, items, userId, profileName, profileLocation, profileBio]);

  const CurrentIcon = currentLevelInfo.icon;

  return (
    <div className="pt-6 px-4 md:px-8 pb-32 max-w-5xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-surface-variant pb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-on-surface hover:bg-surface-variant transition-colors font-label-md text-sm cursor-pointer"
          style={{ minHeight: "44px" }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t("level.backToProfile", "Back to Profile")}</span>
        </button>
        <span className="font-mono text-xs text-on-surface-variant/70 tracking-wider">FINDTRACK REWARDS</span>
      </div>

      {/* Hero Impact Badge Header */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 to-transparent pointer-events-none"></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Large Interactive Badge */}
          <div className="relative shrink-0">
            <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center border-4 ${currentLevelInfo.badgeColor} shadow-md relative`}>
              <CurrentIcon className="h-12 w-12 text-primary" />
              <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-primary text-on-primary px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow">
                Level {currentLevelInfo.level}
              </div>
            </div>
          </div>

          {/* Points Progress */}
          <div className="flex-1 w-full text-center md:text-left space-y-3">
            <div>
              <span className="font-label-sm text-xs text-primary uppercase tracking-wider font-bold">Community Impact Rank</span>
              <h1 className="font-headline-lg text-3xl font-bold text-on-surface mt-1">{currentLevelInfo.name}</h1>
              <p className="font-body-md text-on-surface-variant mt-1.5 max-w-xl">
                {currentLevelInfo.description}
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                <span>{totalPoints} Points</span>
                {nextLevelInfo ? (
                  <span>Next: {nextLevelInfo.name} ({nextLevelInfo.minPoints} pts)</span>
                ) : (
                  <span>Maximum level achieved!</span>
                )}
              </div>
              <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden border border-outline-variant/20">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              {nextLevelInfo && (
                <p className="text-[11px] text-on-surface-variant/70 italic">
                  Earn {nextLevelInfo.minPoints - totalPoints} more points to level up!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Roadmap & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Achievements Column */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="font-headline-md text-xl font-bold text-on-surface">Bayanihan Achievements</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const AchIcon = ach.icon;
              return (
                <div 
                  key={ach.id} 
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                    ach.unlocked 
                      ? "bg-surface-container-lowest border-outline-variant shadow-sm hover:shadow-md" 
                      : "bg-surface-container/35 border-outline-variant/30 opacity-75"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${ach.color}`}>
                        <AchIcon className="h-5 w-5" />
                      </div>
                      {ach.unlocked ? (
                        <span className="bg-primary-container text-on-primary-container border border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="bg-surface-container text-on-surface-variant/60 border border-outline-variant/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Locked
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-sm font-semibold text-on-surface">{ach.title}</h3>
                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-1">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-variant/50 flex justify-between items-center text-[10px] font-medium text-on-surface-variant/80">
                    <span>Target:</span>
                    <span className="font-semibold">{ach.criteria}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Level Tiers Breakdown List */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-surface-variant">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-headline-md text-base font-bold text-on-surface">Impact Rank Path</h3>
            </div>
            <div className="space-y-4">
              {levels.map((lvl) => {
                const LvlIcon = lvl.icon;
                const isCurrent = totalPoints >= lvl.minPoints && totalPoints <= lvl.maxPoints;
                const isPassed = totalPoints > lvl.maxPoints;
                
                return (
                  <div 
                    key={lvl.level} 
                    className={`flex items-start gap-4 p-3 rounded-xl transition-colors ${
                      isCurrent 
                        ? "bg-primary-container/10 border border-primary/20" 
                        : isPassed 
                        ? "opacity-80" 
                        : "opacity-60"
                    }`}
                  >
                    <div className={`p-2 rounded-full border ${lvl.badgeColor} shrink-0`}>
                      <LvlIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-headline-sm text-sm font-semibold text-on-surface">
                          Level {lvl.level}: {lvl.name}
                        </h4>
                        <span className="font-mono text-[11px] text-on-surface-variant font-medium">
                          {lvl.minPoints === 500 ? "500+ pts" : `${lvl.minPoints} - ${lvl.maxPoints} pts`}
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant">
                        {lvl.description}
                      </p>
                      {isCurrent && (
                        <span className="inline-block mt-1 bg-primary text-on-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Your Current Rank
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Leaderboard */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-headline-md text-xl font-bold text-on-surface">Leaderboard</h2>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-sm">
            <div className="p-4 bg-primary/5 border-b border-surface-variant flex items-center justify-between">
              <span className="font-label-md text-xs uppercase font-bold text-primary tracking-wider font-semibold">Top Contributors</span>
              <HelpCircle className="h-4 w-4 text-on-surface-variant/60 cursor-help" title="Rankings based on total items reported and successfully reunited." />
            </div>

            {loadingUsers ? (
              <div className="p-8 flex flex-col items-center justify-center text-on-surface-variant/70 text-xs gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading rankings...</span>
              </div>
            ) : (
              <div className="divide-y divide-surface-variant/60">
                {realLeaderboard.map((user, idx) => (
                  <div 
                    key={user.id} 
                    className={`p-4 flex items-center justify-between transition-colors ${
                      user.isCurrentUser ? "bg-primary-container/15 font-semibold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-sm font-bold text-on-surface-variant w-4">
                        {idx + 1}
                      </span>
                      <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 ${
                        user.isCurrentUser ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant"
                      }`}>
                        {user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("/")) ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fall back gracefully to the first letter if loading fails
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallbackSpan = document.createElement('span');
                                fallbackSpan.textContent = user.name ? user.name.charAt(0).toUpperCase() : "U";
                                parent.appendChild(fallbackSpan);
                              }
                            }}
                          />
                        ) : (
                          <span>{user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : "U")}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-headline-sm text-sm text-on-surface truncate">
                          {user.name} {user.isCurrentUser && <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full ml-1 font-bold">YOU</span>}
                        </p>
                        <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 text-tertiary-container" fill="currentColor" /> Level {user.level} Rank
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-bold text-on-surface">
                        {user.points} pts
                      </p>
                      <p className="text-[9px] text-on-surface-variant/80">
                        {user.reports} rep • {user.reunited} reun
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Gamification Guide */}
            <div className="p-4 bg-surface-container-low border-t border-surface-variant text-center space-y-2">
              <h4 className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wide">How to earn points:</h4>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-on-surface-variant">
                <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant/30">
                  <p className="text-primary font-bold">+15 PTS</p>
                  <p>Each item report</p>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant/30">
                  <p className="text-tertiary font-bold">+50 PTS</p>
                  <p>Item hand-over</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
