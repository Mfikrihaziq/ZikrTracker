#!/bin/bash
# ==============================================================================
# Script: trim_zikr_audio.sh
# Purpose: Trims and normalizes exact Arabic Zikr recitations by Sheikh Mishary
#          Rashid Alafasy into isolated MP3 clips stored in public/assets/aistudio/audio/
# ==============================================================================

set -e

OUTPUT_DIR="./public/assets/aistudio/audio"
TEMP_DIR="/tmp/mishary_exact"
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "Processing and trimming Mishary Rashid Alafasy audio clips..."

# Helper function to trim and normalize
# Usage: process_audio <source_file> <start_time> <end_time> <output_filename> [fade_out_start]
process_audio() {
  local SOURCE="$1"
  local START="$2"
  local END="$3"
  local FILENAME="$4"
  local FADE_OUT_START="$5"

  local RAW_CLIP="$TEMP_DIR/${FILENAME}"
  local FINAL_CLIP="$OUTPUT_DIR/${FILENAME}"

  if [ ! -f "$SOURCE" ]; then
    echo "⚠ Notice: Source file $SOURCE not found in local temp storage. Keeping existing $FINAL_CLIP."
    return 0
  fi

  # 1. Trim with precise microsecond seeking
  ffmpeg -y -hide_banner -loglevel error \
    -ss "$START" -to "$END" -i "$SOURCE" \
    "$RAW_CLIP"

  # 2. Automatically compute fade-out start if omitted, "auto", or out of bounds
  local DURATION
  DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$RAW_CLIP" 2>/dev/null || echo "0")

  if [ -z "$FADE_OUT_START" ] || [ "$FADE_OUT_START" = "auto" ]; then
    FADE_OUT_START=$(python3 -c "print(max(0.1, round(float('$DURATION') - 0.25, 2)))" 2>/dev/null || echo "0.1")
  else
    # Safety check: if user supplied an old fade time from a shorter trim, prevent muting the rest of the clip
    FADE_OUT_START=$(python3 -c "
dur = float('$DURATION')
fade = float('$FADE_OUT_START')
if fade > dur or (dur - fade) > 1.5:
    print(round(max(0.1, dur - 0.25), 2))
else:
    print(fade)
" 2>/dev/null || echo "$FADE_OUT_START")
  fi

  # 3. Apply gentle anti-pop fades (40ms in, 200ms out) and EBU R128 loudness normalization (-16 LUFS)
  ffmpeg -y -hide_banner -loglevel error \
    -i "$RAW_CLIP" \
    -af "afade=t=in:st=0:d=0.04,afade=t=out:st=${FADE_OUT_START}:d=0.20,loudnorm=I=-16:LRA=11:TP=-1.5" \
    -c:a libmp3lame -b:a 128k -ar 44100 \
    "$FINAL_CLIP"

  echo "✓ Generated: $FINAL_CLIP (duration: ${DURATION}s, fade-out at: ${FADE_OUT_START}s)"
}

# ------------------------------------------------------------------------------
# 1. SubhanAllah (سُبْحَانَ اللَّهِ)
# Source: Post-Salah Adhkar (Azkar As-Salah) by Mishary Alafasy
# ------------------------------------------------------------------------------
# process_audio "/tmp/azkar_salah.mp3" "00:00:00.180" "00:00:02.374" "subhanallah.mp3" "2.10"

# ------------------------------------------------------------------------------
# 2. Alhamdulillah (الْحَمْدُ لِلَّهِ)
# Source: Post-Salah Adhkar by Mishary Alafasy
# ------------------------------------------------------------------------------
# process_audio "/tmp/azkar_salah.mp3" "00:00:02.500" "00:00:04.850" "alhamdulillah.mp3" "2.20"

# ------------------------------------------------------------------------------
# 3. Allahu Akbar (اللَّهُ أَكْبَرُ)
# Source: Post-Salah Adhkar by Mishary Alafasy
# ------------------------------------------------------------------------------
# process_audio "/tmp/azkar_salah.mp3" "00:00:05.000" "00:00:07.450" "allahuakbar.mp3" "2.30"

# ------------------------------------------------------------------------------
# 4. Astaghfirullah (أَسْتَغْفِرُ اللَّهَ)
# Source: Post-Salah Adhkar by Mishary Alafasy
# ------------------------------------------------------------------------------
# process_audio "/tmp/azkar_salah.mp3" "00:00:00.050" "00:00:03.200" "astaghfirullah.mp3" "3.00"

# ------------------------------------------------------------------------------
# 5. Hasbunallahu wa ni'mal-Wakeel (حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ)
# Source: Quran Surah Ali 'Imran (3:173) by Mishary Alafasy
# ------------------------------------------------------------------------------
# process_audio "/tmp/003173.mp3" "00:00:08.600" "00:00:13.700" "hasbunallah.mp3" "4.90"

# ------------------------------------------------------------------------------
# 6. La hawla wa la quwwata illa billah (لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ)
# Source: Hisnul Muslim Adhkar by Mishary Alafasy
# ------------------------------------------------------------------------------
# Trimmed to stop after "illa billah" (at ~4.0s) avoiding trailing secondary recitation
process_audio "/tmp/chunk_450.mp3" "00:00:02.100" "00:00:06.180" "lahawla.mp3" "3.85"

# ------------------------------------------------------------------------------
# 7. La ilaha illallah (لَا إِلٰهَ إِلَّا اللَّهُ)
# Source: Kalimah Tawheed recitation by Sheikh Mishary Rashid Alafasy
# Hadith: "أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ" (Sunan at-Tirmidhi 3383)
#
# Available configurations:
#   Option A (Immediate Tahlil - ~3.75s): 00:00:01.650 to 00:00:05.400 (Cuts 350ms lead-in; starts immediately on "Lā", optimal for tasbih)
#   Option B (Standard Tahlil - ~4.10s):  00:00:01.300 to 00:00:05.400 (Includes pre-breath lead-in)
#   Option C (Full Tahlil with Tawheed from /tmp/morning.mp3 - ~9.5s):
#             "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ"
# ------------------------------------------------------------------------------
process_audio "/tmp/chunk_600.mp3" "00:00:01.650" "00:00:05.400" "lailahaillallah.mp3" "auto"

# ------------------------------------------------------------------------------
# 8. SubhanAllahi wa bihamdihi (سُبْحَانَ اللَّهِ وَبِحَمْدِهِ)
# Source: Morning Adhkar by Mishary Alafasy
# ------------------------------------------------------------------------------
# process_audio "/tmp/morning.mp3" "00:10:48.200" "00:10:52.100" "subhanallahi-wa-bihamdihi.mp3" "3.70"

echo "All audio clips are available in $OUTPUT_DIR"
