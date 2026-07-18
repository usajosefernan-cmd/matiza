#!/usr/bin/env python3
import sys
import os
import json
import datetime
import pickle
import instaloader

def main():
    session_file = '/home/ubuntu/db/matiza/instaloader_session'
    if not os.path.exists(session_file) and os.path.exists('/home/ubuntu/db/matiza/instaloader_session'):
        session_file = '/home/ubuntu/db/matiza/instaloader_session'
    
    # Initialize Instaloader with settings to avoid downloading files locally
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        save_metadata=False,
        quiet=True
    )

    if os.path.exists(session_file):
        try:
            # Load session using a dummy username, then retrieve the correct username
            with open(session_file, 'rb') as f:
                sessiondata = pickle.load(f)
            L.context.load_session("dummy_user", sessiondata)
            
            real_username = L.test_login()
            if real_username:
                L.context.username = real_username
                sys.stderr.write(f"Logged in to Instagram as {real_username}\n")
            else:
                sys.stderr.write("Instagram session is invalid or expired. Running anonymously.\n")
        except Exception as e:
            sys.stderr.write(f"Failed to load Instagram session: {str(e)}. Running anonymously.\n")
    else:
        sys.stderr.write("No Instagram session file found. Running anonymously.\n")

    now = datetime.datetime.now(datetime.timezone.utc)
    limit_hours = 24
    items = []
    seen_urls = set()

    # 1. Scrape Hashtags
    hashtags = ['bulo', 'okupa', 'inmigracionEspana']
    for tag_name in hashtags:
        try:
            hashtag = instaloader.Hashtag.from_name(L.context, tag_name)
            count = 0
            for post in hashtag.get_posts():
                # Instaloader post.date_utc is naive but represents UTC time
                post_date = post.date_utc.replace(tzinfo=datetime.timezone.utc)
                diff = now - post_date
                
                # Check 24 hour limit
                if diff.total_seconds() > limit_hours * 3600:
                    if count > 20:
                        break
                    continue

                url = f"https://www.instagram.com/p/{post.shortcode}/"
                if url in seen_urls:
                    continue
                seen_urls.add(url)

                caption = post.caption or ""
                title = caption.split('\n')[0] if caption else "Instagram Post"
                if len(title) > 180:
                    title = title[:177] + "..."

                items.append({
                    "title": title,
                    "link": url,
                    "description": caption,
                    "platform": "Instagram",
                    "author": post.owner_username,
                    "score": post.likes,
                    "comments": post.comments,
                    "views": post.video_view_count if post.is_video else 0,
                    "origin_date": post_date.isoformat(),
                    "imageUrl": post.url
                })
                count += 1
                if count >= 30:  # Cap per hashtag
                    break
        except Exception as e:
            # Continue to other sources on error
            sys.stderr.write(f"Error scraping hashtag #{tag_name}: {str(e)}\n")

    # 2. Scrape Following Feed
    try:
        count = 0
        for post in L.get_feed_posts():
            post_date = post.date_utc.replace(tzinfo=datetime.timezone.utc)
            diff = now - post_date
            
            if diff.total_seconds() > limit_hours * 3600:
                if count > 20:
                    break
                continue

            url = f"https://www.instagram.com/p/{post.shortcode}/"
            if url in seen_urls:
                continue
            seen_urls.add(url)

            caption = post.caption or ""
            title = caption.split('\n')[0] if caption else "Instagram Feed Post"
            if len(title) > 180:
                title = title[:177] + "..."

            items.append({
                "title": title,
                "link": url,
                "description": caption,
                "platform": "Instagram",
                "author": post.owner_username,
                "score": post.likes,
                "comments": post.comments,
                "views": post.video_view_count if post.is_video else 0,
                "origin_date": post_date.isoformat(),
                "imageUrl": post.url
            })
            count += 1
            if count >= 50:  # Cap for feed
                break
    except Exception as e:
        sys.stderr.write(f"Error scraping following feed: {str(e)}\n")

    print(json.dumps(items, indent=2))

if __name__ == '__main__':
    main()
