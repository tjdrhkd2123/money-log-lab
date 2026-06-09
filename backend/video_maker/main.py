import os
import sys

# Dynamically append local libs and user site-packages to sys.path
# This guarantees that packages installed in local "libs" or via "pip install --user" are fully imported on Render!
try:
    # 1. Local libs directory (highly reliable target directory install)
    libs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'libs')
    if os.path.exists(libs_dir) and libs_dir not in sys.path:
        sys.path.insert(0, libs_dir)
        print(f"DEBUG: Appended local libs to sys.path: {libs_dir}")

    # 2. Expand user site-packages (pip install --user)
    user_site_packages = os.path.expanduser('~/.local/lib/python{}.{}/site-packages'.format(sys.version_info.major, sys.version_info.minor))
    if os.path.exists(user_site_packages) and user_site_packages not in sys.path:
        sys.path.insert(0, user_site_packages)
        print(f"DEBUG: Appended user site-packages to sys.path: {user_site_packages}")
except Exception as e:
    print(f"Warning: Failed to dynamically append search paths: {e}")

import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip, TextClip
import datetime

# --- 설정 ---
ASSETS_DIR = "assets"
OUTPUT_DIR = "output"
LOGI_IMAGE = os.path.join(ASSETS_DIR, "logi_anchor.png") # 로기 캐릭터 (배경투명 권장)
FONT_PATH = os.path.join(ASSETS_DIR, "NanumGothic-Bold.ttf")
VOICE = "ko-KR-SunHiNeural" # 밝은 여성(연구원/친근한 느낌) 목소리

def ensure_korean_font():
    if not os.path.exists(FONT_PATH):
        print("📥 Downloading Korean Font (NanumGothic-Bold)...")
        try:
            import urllib.request
            url = "https://github.com/google/fonts/raw/main/ofl/nanumgothic/NanumGothic-Bold.ttf"
            urllib.request.urlretrieve(url, FONT_PATH)
            print("✅ Font downloaded successfully!")
        except Exception as e:
            print(f"⚠️ Failed to download font: {e}. Will fallback to default font.")

# 뉴스 스크립트 예시 (6개 씬)
SCENES = [
    {"type": "intro", "text": "안녕하세요! 다람쥐 연구원 로기에요. 오늘의 경제 핵심만 쏙쏙 짚어드릴게요!", "bg_color": (255, 240, 230)},
    {"type": "coin", "text": "첫 번째는 코인 소식입니다. 비트코인이 1억 원을 다시 돌파하며 불장을 예고하고 있습니다.", "bg_color": (245, 158, 11)},
    {"type": "stock", "text": "다음은 주식입니다. 삼성전자가 HBM 메모리 수주에 성공하며 8만 전자를 회복했습니다.", "bg_color": (59, 130, 246)},
    {"type": "economy", "text": "경제 지표 볼까요? 미국 금리 인하가 지연되면서 원달러 환율이 1380원까지 치솟았습니다.", "bg_color": (16, 185, 129)},
    {"type": "real_estate", "text": "부동산 소식입니다. 서울 강남 아파트 급매물이 빠르게 소진되며 바닥을 다졌다는 평가가 나옵니다.", "bg_color": (139, 92, 246)},
    {"type": "outro", "text": "더 자세한 분석은 로기의 머니로그랩에서 확인하세요! 구독과 좋아요 부탁드려요!", "bg_color": (255, 240, 230)}
]

async def generate_tts(text, output_path):
    print(f"🎙️ 음성 생성 중: {text[:20]}...")
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(output_path)

def create_bg_image(scene_type, color, output_path):
    # 간단한 배경색 + 텍스트 생성 (720x1280 해상도로 RAM 최적화)
    img = Image.new('RGB', (720, 1280), color=color)
    draw = ImageDraw.Draw(img)
    # 텍스트 추가는 폰트가 필요하므로 생략하거나 시스템 폰트 사용 가능하지만 생략
    img.save(output_path)

async def main():
    print("🚀 로기 쇼츠(Shorts) 비디오 생성 시작!")
    
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    clips = []
    
    # 1. 씬 별로 오디오 및 이미지 준비
    for i, scene in enumerate(SCENES):
        # 오디오 생성
        audio_path = os.path.join(OUTPUT_DIR, f"audio_{i}.mp3")
        await generate_tts(scene['text'], audio_path)
        
        # 임시 배경 생성 (사용자가 나중에 assets/coin_bg.png 등으로 교체 가능)
        bg_path = os.path.join(ASSETS_DIR, f"{scene['type']}_bg.png")
        if not os.path.exists(bg_path):
            create_bg_image(scene['type'], scene['bg_color'], bg_path)
            
        # MoviePy 클립 생성
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration
        
        # 1. Load background image and compose in PIL
        ensure_korean_font()
        
        bg_img = Image.open(bg_path).convert('RGBA')
        bg_img = bg_img.resize((720, 1280), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.ANTIALIAS)
        
        # 2. Paste logi mascot character in the middle
        if os.path.exists(LOGI_IMAGE):
            logi_img = Image.open(LOGI_IMAGE).convert('RGBA')
            w, h = logi_img.size
            new_w = 500
            new_h = int(h * (new_w / w))
            resample_filter = Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.ANTIALIAS
            logi_img = logi_img.resize((new_w, new_h), resample_filter)
            
            x = (720 - new_w) // 2
            y = (1280 - new_h) // 2
            bg_img.alpha_composite(logi_img, (x, y))
            
        # 3. Draw subtitles at the bottom
        draw = ImageDraw.Draw(bg_img)
        font_size = 28
        try:
            font = ImageFont.truetype(FONT_PATH, font_size)
        except Exception:
            font = ImageFont.load_default()
            
        text = scene['text']
        words = text.split(' ')
        lines = []
        current_line = ""
        
        for word in words:
            test_line = current_line + " " + word if current_line else word
            try:
                bbox = draw.textbbox((0, 0), test_line, font=font)
                line_w = bbox[2] - bbox[0]
            except AttributeError:
                line_w, _ = draw.textsize(test_line, font=font)
                
            if line_w <= 600:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)
            
        line_height = font_size + 10
        total_height = len(lines) * line_height
        box_padding = 15
        box_y1 = 1100 - total_height - box_padding
        box_y2 = 1100 + box_padding
        
        # Draw dark background overlay for subtitle readability
        overlay = Image.new('RGBA', bg_img.size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        try:
            overlay_draw.rounded_rectangle([60 - box_padding, box_y1, 660 + box_padding, box_y2], fill=(0, 0, 0, 160), radius=10)
        except AttributeError:
            overlay_draw.rectangle([60 - box_padding, box_y1, 660 + box_padding, box_y2], fill=(0, 0, 0, 160))
            
        bg_img = Image.alpha_composite(bg_img, overlay)
        draw = ImageDraw.Draw(bg_img)
        
        current_y = box_y1 + box_padding
        for line in lines:
            try:
                bbox = draw.textbbox((0, 0), line, font=font)
                w = bbox[2] - bbox[0]
            except AttributeError:
                w, _ = draw.textsize(line, font=font)
            x = (720 - w) // 2
            draw.text((x, current_y), line, font=font, fill=(255, 255, 255, 255))
            current_y += line_height
            
        # Save composed frame image
        composed_frame_path = os.path.join(OUTPUT_DIR, f"frame_{i}.png")
        bg_img.convert('RGB').save(composed_frame_path)
        
        # Create MoviePy clip directly from the single pre-composed frame
        final_clip = ImageClip(composed_frame_path).set_duration(duration).set_audio(audio_clip)
        clips.append(final_clip)
        print(f"✅ 씬 {i+1} 준비 완료!")

    # 2. 클립 합치기
    print("🎬 영상 병합 및 렌더링 중... (시간이 조금 걸릴 수 있습니다)")
    final_video = concatenate_videoclips(clips)
    
    today_str = datetime.datetime.now().strftime("%Y%m%d")
    output_filename = os.path.join(OUTPUT_DIR, f"logi_shorts_{today_str}.mp4")
    
    # 초경량 단일 스레드 + ultrafast 프리셋을 적용해 Render.com 512MB RAM 오버플로우 영구 예방
    final_video.write_videofile(
        output_filename, 
        fps=24, 
        codec="libx264", 
        audio_codec="aac", 
        threads=1, 
        preset="ultrafast"
    )
    print(f"🎉 성공적으로 영상이 생성되었습니다: {output_filename}")
    
    # 메모리 누수 원천 차단을 위한 명시적 클립 닫기 (NumPy 가비지 컬렉션 트리거)
    final_video.close()
    for clip in clips:
        clip.close()
        
    # 임시 이미지 프레임 파일 삭제 청소
    for i in range(len(SCENES)):
        try:
            frame_path = os.path.join(OUTPUT_DIR, f"frame_{i}.png")
            if os.path.exists(frame_path):
                os.remove(frame_path)
        except Exception as e:
            print(f"Warning: 임시 프레임 파일 삭제 실패: {e}")

if __name__ == "__main__":
    asyncio.run(main())
