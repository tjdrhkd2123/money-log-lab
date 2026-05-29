import os
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip, TextClip
import datetime

# --- 설정 ---
ASSETS_DIR = "assets"
OUTPUT_DIR = "output"
LOGI_IMAGE = os.path.join(ASSETS_DIR, "logi_anchor.png") # 로기 캐릭터 (배경투명 권장)
VOICE = "ko-KR-SunHiNeural" # 밝은 여성(연구원/친근한 느낌) 목소리

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
    # 간단한 배경색 + 텍스트 생성 (사용자가 나중에 진짜 이미지로 교체 가능)
    img = Image.new('RGB', (1080, 1920), color=color)
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
        
        # 1080x1920 쇼츠 세로 해상도
        img_clip = ImageClip(bg_path).set_duration(duration).resize((1080, 1920))
        
        # 로기 캐릭터 추가 (캐릭터 이미지가 있으면 덮어쓰기)
        if os.path.exists(LOGI_IMAGE):
            logi_clip = ImageClip(LOGI_IMAGE).resize(width=800).set_position(('center', 'bottom')).set_duration(duration)
            final_clip = CompositeVideoClip([img_clip, logi_clip]).set_audio(audio_clip)
        else:
            final_clip = img_clip.set_audio(audio_clip)
            
        clips.append(final_clip)
        print(f"✅ 씬 {i+1} 준비 완료!")

    # 2. 클립 합치기
    print("🎬 영상 병합 및 렌더링 중... (시간이 조금 걸릴 수 있습니다)")
    final_video = concatenate_videoclips(clips)
    
    today_str = datetime.datetime.now().strftime("%Y%m%d")
    output_filename = os.path.join(OUTPUT_DIR, f"logi_shorts_{today_str}.mp4")
    
    final_video.write_videofile(output_filename, fps=24, codec="libx264", audio_codec="aac")
    print(f"🎉 성공적으로 영상이 생성되었습니다: {output_filename}")

if __name__ == "__main__":
    asyncio.run(main())
