import React, { useState, useEffect } from 'react';

export default function LinkifyMentions({ html }) {
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    // 1) pull out all unique slugs
    const slugs = Array.from(
      new Set(
        Array.from(html.matchAll(/@([a-z0-9_-]+)/gi), m => m[1])
      )
    );
    if (!slugs.length) return;

    // 2) batch‐fetch each one individually
    const fetchUsers = async () => {
      try {
        const results = await Promise.all(
          slugs.map(slug =>
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL_V1}/users?username=${encodeURIComponent(
                slug
              )}`
            ).then(r => r.json())
          )
        );
        // flatten & build map by slug
        const users = results.flat();
        const map = {};
        users.forEach(u => {
          map[u.id] = {
            label: u.label,
            profile: u.profile,
            avatar: u.avatar,
            slug: u.id
          };
        });
        setUserMap(map);
      } catch (err) {
        console.error('Mention fetch failed:', err);
      }
    };

    fetchUsers();
  }, [html]);

  // 3) replace every “@slug” with a proper <a>
  const replaced = html.replace(
    /@([a-z0-9_-]+)/gi,
    (match, slug) => {
      const u = userMap[slug];
      return u
        ? `<a href="/users/${u.slug}" class="mention-link">@${u.label}</a>`
        : match;
    }
  );

  return <span dangerouslySetInnerHTML={{ __html: replaced }} />;
}