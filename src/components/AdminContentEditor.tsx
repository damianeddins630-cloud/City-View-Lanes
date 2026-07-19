"use client";

import { FormEvent, useEffect, useState } from "react";
import { defaultSiteContent } from "@/lib/siteContent";
import type { SiteContent } from "@/lib/types";

type Props = {
  onNotice: (msg: string) => void;
  onError: (msg: string) => void;
};

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function PhotoSlot({
  label,
  src,
  alt,
  onSrc,
  onAlt,
  onUploaded,
  onError,
}: {
  label: string;
  src: string;
  alt: string;
  onSrc: (v: string) => void;
  onAlt: (v: string) => void;
  onUploaded: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Upload failed");
        return;
      }
      onSrc(data.url);
      onUploaded(`Photo updated for ${label}. Click Save all changes below.`);
    } catch {
      onError("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel space-y-3 p-4">
      <p className="text-xs font-bold tracking-wide text-[var(--blue-bright)] uppercase">
        {label}
      </p>
      <div className="relative h-36 overflow-hidden border border-[var(--line)] bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || label} className="h-full w-full object-cover" />
      </div>
      <Field label="Photo URL (or upload)" value={src} onChange={onSrc} />
      <Field label="Photo description (alt text)" value={alt} onChange={onAlt} />
      <label className="btn btn-ghost w-fit cursor-pointer text-[10px]">
        {busy ? "Uploading…" : "Upload new photo"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          disabled={busy}
          onChange={(e) => void onFile(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}

export default function AdminContentEditor({ onNotice, onError }: Props) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.content) setContent(d.content);
      })
      .catch(() => {
        if (alive) onError("Could not load page content");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    onError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Save failed");
        return;
      }
      setContent(data.content);
      onNotice("Homepage & youth page content saved. Refresh the live site to see it.");
    } catch {
      onError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="mt-6 text-sm text-[var(--muted)]">Loading page editor…</p>;
  }

  const h = content.home;
  const y = content.youth;

  return (
    <form onSubmit={save} className="mt-6 space-y-8">
      <div className="panel p-5">
        <h2 className="font-display text-2xl text-white">Edit website pictures & text</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Change photos and descriptions for the main homepage and the Youth
          section on Leagues — no code needed. Upload a photo, edit the words,
          then click <strong className="text-white">Save all changes</strong>.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="font-display text-3xl text-white">Homepage — Hero</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <PhotoSlot
            label="Main hero picture"
            src={h.heroImage}
            alt={h.heroImageAlt}
            onSrc={(v) => setContent({ ...content, home: { ...h, heroImage: v } })}
            onAlt={(v) =>
              setContent({ ...content, home: { ...h, heroImageAlt: v } })
            }
            onUploaded={onNotice}
            onError={onError}
          />
          <div className="space-y-3">
            <Field
              label="Big title line 1"
              value={h.heroTitleLine1}
              onChange={(v) =>
                setContent({ ...content, home: { ...h, heroTitleLine1: v } })
              }
            />
            <Field
              label="Big title line 2"
              value={h.heroTitleLine2}
              onChange={(v) =>
                setContent({ ...content, home: { ...h, heroTitleLine2: v } })
              }
            />
            <Field
              label="Hero description"
              value={h.heroSubtitle}
              multiline
              onChange={(v) =>
                setContent({ ...content, home: { ...h, heroSubtitle: v } })
              }
            />
            <Field
              label="Scrolling words (comma separated)"
              value={h.marquee.join(", ")}
              onChange={(v) =>
                setContent({
                  ...content,
                  home: {
                    ...h,
                    marquee: v
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-3xl text-white">Homepage — Why section</h3>
        <div className="grid gap-3">
          <Field
            label="Small label"
            value={h.whyKicker}
            onChange={(v) => setContent({ ...content, home: { ...h, whyKicker: v } })}
          />
          <Field
            label="Headline"
            value={h.whyTitle}
            onChange={(v) => setContent({ ...content, home: { ...h, whyTitle: v } })}
          />
          <Field
            label="Description"
            value={h.whyCopy}
            multiline
            onChange={(v) => setContent({ ...content, home: { ...h, whyCopy: v } })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {h.whyCards.map((card, idx) => (
            <div key={idx} className="panel space-y-2 p-4">
              <p className="text-xs font-bold text-[var(--blue-bright)] uppercase">
                Feature {idx + 1}
              </p>
              <Field
                label="Title"
                value={card.title}
                onChange={(v) => {
                  const whyCards = [...h.whyCards];
                  whyCards[idx] = { ...card, title: v };
                  setContent({ ...content, home: { ...h, whyCards } });
                }}
              />
              <Field
                label="Description"
                value={card.copy}
                multiline
                onChange={(v) => {
                  const whyCards = [...h.whyCards];
                  whyCards[idx] = { ...card, copy: v };
                  setContent({ ...content, home: { ...h, whyCards } });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-3xl text-white">Homepage — Academy</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <PhotoSlot
            label="Academy picture"
            src={h.academyImage}
            alt={h.academyImageAlt}
            onSrc={(v) =>
              setContent({ ...content, home: { ...h, academyImage: v } })
            }
            onAlt={(v) =>
              setContent({ ...content, home: { ...h, academyImageAlt: v } })
            }
            onUploaded={onNotice}
            onError={onError}
          />
          <div className="space-y-3">
            <Field
              label="Small label"
              value={h.academyKicker}
              onChange={(v) =>
                setContent({ ...content, home: { ...h, academyKicker: v } })
              }
            />
            <Field
              label="Headline"
              value={h.academyTitle}
              onChange={(v) =>
                setContent({ ...content, home: { ...h, academyTitle: v } })
              }
            />
            <Field
              label="Description"
              value={h.academyCopy}
              multiline
              onChange={(v) =>
                setContent({ ...content, home: { ...h, academyCopy: v } })
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Stat 1 number"
                value={h.academyStat1Value}
                onChange={(v) =>
                  setContent({ ...content, home: { ...h, academyStat1Value: v } })
                }
              />
              <Field
                label="Stat 1 label"
                value={h.academyStat1Label}
                onChange={(v) =>
                  setContent({ ...content, home: { ...h, academyStat1Label: v } })
                }
              />
              <Field
                label="Stat 2 number"
                value={h.academyStat2Value}
                onChange={(v) =>
                  setContent({ ...content, home: { ...h, academyStat2Value: v } })
                }
              />
              <Field
                label="Stat 2 label"
                value={h.academyStat2Label}
                onChange={(v) =>
                  setContent({ ...content, home: { ...h, academyStat2Label: v } })
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-3xl text-white">Homepage — Gallery</h3>
        <Field
          label="Small label"
          value={h.galleryKicker}
          onChange={(v) =>
            setContent({ ...content, home: { ...h, galleryKicker: v } })
          }
        />
        <Field
          label="Headline"
          value={h.galleryTitle}
          onChange={(v) =>
            setContent({ ...content, home: { ...h, galleryTitle: v } })
          }
        />
        <Field
          label="Description"
          value={h.galleryCopy}
          multiline
          onChange={(v) =>
            setContent({ ...content, home: { ...h, galleryCopy: v } })
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {h.galleryImages.map((img, idx) => (
            <PhotoSlot
              key={idx}
              label={`Gallery photo ${idx + 1}`}
              src={img.src}
              alt={img.alt}
              onSrc={(v) => {
                const galleryImages = [...h.galleryImages];
                galleryImages[idx] = { ...img, src: v };
                setContent({ ...content, home: { ...h, galleryImages } });
              }}
              onAlt={(v) => {
                const galleryImages = [...h.galleryImages];
                galleryImages[idx] = { ...img, alt: v };
                setContent({ ...content, home: { ...h, galleryImages } });
              }}
              onUploaded={onNotice}
              onError={onError}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-3xl text-white">Homepage — Reviews</h3>
        <Field
          label="Small label"
          value={h.reviewsKicker}
          onChange={(v) =>
            setContent({ ...content, home: { ...h, reviewsKicker: v } })
          }
        />
        <Field
          label="Headline"
          value={h.reviewsTitle}
          onChange={(v) =>
            setContent({ ...content, home: { ...h, reviewsTitle: v } })
          }
        />
        <div className="grid gap-3 md:grid-cols-3">
          {h.reviews.map((review, idx) => (
            <div key={idx} className="panel space-y-2 p-4">
              <p className="text-xs font-bold text-[var(--blue-bright)] uppercase">
                Review {idx + 1}
              </p>
              <Field
                label="Quote"
                value={review.quote}
                multiline
                onChange={(v) => {
                  const reviews = [...h.reviews];
                  reviews[idx] = { ...review, quote: v };
                  setContent({ ...content, home: { ...h, reviews } });
                }}
              />
              <Field
                label="Name"
                value={review.name}
                onChange={(v) => {
                  const reviews = [...h.reviews];
                  reviews[idx] = { ...review, name: v };
                  setContent({ ...content, home: { ...h, reviews } });
                }}
              />
              <Field
                label="Role"
                value={review.role}
                onChange={(v) => {
                  const reviews = [...h.reviews];
                  reviews[idx] = { ...review, role: v };
                  setContent({ ...content, home: { ...h, reviews } });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-3xl text-white">Homepage — Visit band</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <PhotoSlot
            label="Visit background picture"
            src={h.visitImage}
            alt="Visit CityView Lanes"
            onSrc={(v) => setContent({ ...content, home: { ...h, visitImage: v } })}
            onAlt={() => undefined}
            onUploaded={onNotice}
            onError={onError}
          />
          <div className="space-y-3">
            <Field
              label="Small label"
              value={h.visitKicker}
              onChange={(v) =>
                setContent({ ...content, home: { ...h, visitKicker: v } })
              }
            />
            <Field
              label="Hours note"
              value={h.visitHoursNote}
              onChange={(v) =>
                setContent({ ...content, home: { ...h, visitHoursNote: v } })
              }
            />
            <Field
              label="Parking note"
              value={h.visitParkingNote}
              onChange={(v) =>
                setContent({ ...content, home: { ...h, visitParkingNote: v } })
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-[var(--line)] pt-8">
        <h3 className="font-display text-3xl text-white">Leagues — Youth section</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <PhotoSlot
            label="Youth / leagues hero picture"
            src={y.heroImage}
            alt="Youth leagues"
            onSrc={(v) => setContent({ ...content, youth: { ...y, heroImage: v } })}
            onAlt={() => undefined}
            onUploaded={onNotice}
            onError={onError}
          />
          <div className="space-y-3">
            <Field
              label="Small label"
              value={y.kicker}
              onChange={(v) => setContent({ ...content, youth: { ...y, kicker: v } })}
            />
            <Field
              label="Title"
              value={y.title}
              onChange={(v) => setContent({ ...content, youth: { ...y, title: v } })}
            />
            <Field
              label="Description"
              value={y.blurb}
              multiline
              onChange={(v) => setContent({ ...content, youth: { ...y, blurb: v } })}
            />
            <Field
              label="Ages"
              value={y.ages}
              onChange={(v) => setContent({ ...content, youth: { ...y, ages: v } })}
            />
            <Field
              label="Season"
              value={y.season}
              onChange={(v) => setContent({ ...content, youth: { ...y, season: v } })}
            />
            <Field
              label="Format / details"
              value={y.format}
              multiline
              onChange={(v) => setContent({ ...content, youth: { ...y, format: v } })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {y.photos.map((photo, idx) => (
            <PhotoSlot
              key={idx}
              label={`Youth photo ${idx + 1}`}
              src={photo.src}
              alt={photo.alt}
              onSrc={(v) => {
                const photos = [...y.photos];
                photos[idx] = { ...photo, src: v };
                setContent({ ...content, youth: { ...y, photos } });
              }}
              onAlt={(v) => {
                const photos = [...y.photos];
                photos[idx] = { ...photo, alt: v };
                setContent({ ...content, youth: { ...y, photos } });
              }}
              onUploaded={onNotice}
              onError={onError}
            />
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {y.playerStates.map((state, idx) => (
            <div key={idx} className="panel space-y-2 p-4">
              <p className="text-xs font-bold text-[var(--blue-bright)] uppercase">
                Player state {idx + 1}
              </p>
              <Field
                label="Code (TX)"
                value={state.code}
                onChange={(v) => {
                  const playerStates = [...y.playerStates];
                  playerStates[idx] = { ...state, code: v };
                  setContent({ ...content, youth: { ...y, playerStates } });
                }}
              />
              <Field
                label="State name"
                value={state.name}
                onChange={(v) => {
                  const playerStates = [...y.playerStates];
                  playerStates[idx] = { ...state, name: v };
                  setContent({ ...content, youth: { ...y, playerStates } });
                }}
              />
              <Field
                label="Note"
                value={state.note}
                onChange={(v) => {
                  const playerStates = [...y.playerStates];
                  playerStates[idx] = { ...state, note: v };
                  setContent({ ...content, youth: { ...y, playerStates } });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-3 z-20 flex flex-wrap gap-3 border border-[var(--line)] bg-[var(--black)]/95 p-4 shadow-2xl backdrop-blur">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save all changes"}
        </button>
        <p className="text-xs text-[var(--muted)] self-center">
          Saves to your site storage (Blob). Refresh Home / Leagues after saving.
        </p>
      </div>
    </form>
  );
}
