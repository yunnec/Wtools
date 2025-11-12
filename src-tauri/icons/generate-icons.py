#!/usr/bin/env python3
"""
梧桐工具箱图标生成器
从 1024x1024 原始图标生成所有需要的尺寸
"""

from PIL import Image
import os

# 输入文件
input_file = "wutong.png"

# 输出尺寸配置
sizes = {
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,  # Retina 显示屏用
    "icon.png": 512,
    "StoreLogo.png": 50,
    "Square30x30Logo.png": 30,
    "Square44x44Logo.png": 44,
    "Square71x71Logo.png": 71,
    "Square89x89Logo.png": 89,
    "Square107x107Logo.png": 107,
    "Square142x142Logo.png": 142,
    "Square150x150Logo.png": 150,
    "Square284x284Logo.png": 284,
    "Square310x310Logo.png": 310,
}

def generate_icons():
    """生成所有尺寸的图标"""
    # 检查输入文件
    if not os.path.exists(input_file):
        print(f"❌ 错误: 找不到输入文件 {input_file}")
        return False

    # 打开原始图像
    try:
        with Image.open(input_file) as img:
            print(f"✅ 成功打开图像: {input_file}")
            print(f"   原始尺寸: {img.size}")
            print(f"   颜色模式: {img.mode}")

            # 确保是RGBA模式（支持透明）
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
                print(f"   转换为 RGBA 模式")

            # 生成各种尺寸
            generated = []
            for filename, size in sizes.items():
                try:
                    # 调整大小
                    resized = img.resize((size, size), Image.Resampling.LANCZOS)

                    # 保存
                    resized.save(filename, 'PNG', optimize=True)
                    generated.append(filename)
                    print(f"✅ 生成: {filename} ({size}x{size})")
                except Exception as e:
                    print(f"❌ 生成失败 {filename}: {e}")

            print(f"\n✨ 成功生成 {len(generated)} 个图标文件")
            return True

    except Exception as e:
        print(f"❌ 处理图像时出错: {e}")
        return False

def generate_ico():
    """生成 Windows ICO 文件"""
    try:
        # 收集不同尺寸的图像
        images = []
        for size in [16, 32, 48, 64, 128]:
            filename = f"{size}x{size}.png"
            if os.path.exists(filename):
                with Image.open(filename) as img:
                    if img.mode != 'RGBA':
                        img = img.convert('RGBA')
                    images.append(img)
            else:
                print(f"⚠️  警告: 找不到 {filename}，将调整原始图像")
                with Image.open(input_file) as img:
                    resized = img.resize((size, size), Image.Resampling.LANCZOS)
                    if resized.mode != 'RGBA':
                        resized = resized.convert('RGBA')
                    images.append(resized)

        if images:
            # 保存为 ICO
            images[0].save('icon.ico', format='ICO', sizes=[(img.width, img.height) for img in images])
            print("✅ 生成: icon.ico")
            return True
        else:
            print("❌ 无法生成 ICO: 没有可用的图像")
            return False

    except Exception as e:
        print(f"❌ 生成 ICO 失败: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🎨 梧桐工具箱图标生成器")
    print("=" * 60)

    # 生成图标
    if generate_icons():
        print("\n" + "=" * 60)
        print("💾 生成 Windows ICO 文件")
        print("=" * 60)
        generate_ico()

        print("\n" + "=" * 60)
        print("✨ 所有图标生成完成！")
        print("=" * 60)

        # 列出生成的文件
        print("\n📋 生成的图标文件:")
        for filename in os.listdir('.'):
            if filename.endswith('.png') or filename.endswith('.ico'):
                size = os.path.getsize(filename)
                print(f"   {filename:<30} {size/1024:>6.1f} KB")
    else:
        print("\n❌ 图标生成失败")
