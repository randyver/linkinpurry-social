import { useState, useEffect, useRef, useCallback } from "react";
import { FeedCard } from "./feed-card";

interface User {
  userId: string;
  username: string;
  email: string;
  fullname: string;
  profilePhotoPath: string;
  name: string;
  id: string;
}

interface Feed {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface FeedProps {
  currentUser: User | null;
}

export default function Feed({ currentUser }: FeedProps) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const LIMIT = 10;

  useEffect(() => {
    isLoadingRef.current = loading;
  }, [loading]);

  // Fetch feeds with pagination
  const fetchFeeds = useCallback(async (cursor?: string) => {
    if (isLoadingRef.current) {
      return;
    }

    try {
      setLoading(true);
      isLoadingRef.current = true;

      const url = new URL("http://localhost:3000/api/feed");
      url.searchParams.append("limit", LIMIT.toString());
      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }

      const response = await fetch(url.toString(), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch feeds");
      }

      const data = await response.json();

      if (data) {
        setFeeds((prevFeeds) => {
          const newFeeds = cursor ? [...prevFeeds, ...data.feeds] : data.feeds;
          return newFeeds;
        });

        setHasMore(data.feeds.length === LIMIT);
      } else {
        console.error("Failed to fetch feeds:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching feeds:", error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!hasMore) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      if (target.isIntersecting && hasMore && !isLoadingRef.current) {
        const lastFeed = feeds[feeds.length - 1];
        if (lastFeed) {
          fetchFeeds(lastFeed.id);
        }
      }
    };

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [feeds, hasMore, fetchFeeds]);

  return (
    <div className="w-full space-y-6">
      {/* Render the feeds */}
      {feeds.map((feed) => (
        <FeedCard
          key={feed.id}
          feedId={Number(feed.id)}
          userId={Number(currentUser?.userId) || 0}
          ownerFeedId={Number(feed.user.id)}
          profilePhoto={
            feed.user.profilePhotoPath || "https://via.placeholder.com/48"
          }
          fullname={feed.user.name}
          date={new Date(feed.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          content={feed.content}
        />
      ))}

      <div ref={observerTarget} />
      {loading && (
        <div className="flex justify-center space-x-2 mt-20">
          <div className="w-6 h-6 bg-wbd-highlight rounded-full animate-bounce"></div>
          <div className="w-6 h-6 bg-wbd-highlight rounded-full animate-bounce delay-100"></div>
          <div className="w-6 h-6 bg-wbd-highlight rounded-full animate-bounce delay-200"></div>
        </div>
      )}
      {!hasMore && feeds.length > 0 && (
        <div className="flex justify-center text-black items-center min-h-[200px]">
          No more feeds to load.
        </div>
      )}
      {!hasMore && feeds.length === 0 && (
        <div className="flex justify-center text-black items-center min-h-[200px]">
          No feeds found.
        </div>
      )}
    </div>
  );
}