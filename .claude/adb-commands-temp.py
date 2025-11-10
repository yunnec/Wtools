#!/usr/bin/env python
import docx
import os

# 获取文档路径
docx_path = os.path.join(os.getcwd(), 'docs', '语音常用命令.docx')

# 检查文件是否存在
if not os.path.exists(docx_path):
    print(f"文件不存在: {docx_path}")
    # 尝试在当前目录查找
    print("当前目录文件:")
    for f in os.listdir('.'):
        print(f"  {f}")
    os.chdir('docs')
    docx_files = [f for f in os.listdir('.') if f.endswith('.docx')]
    if docx_files:
        docx_path = docx_files[0]
        print(f"找到文件: {docx_path}")
    else:
        print("未找到docx文件")
        exit(1)

print(f"正在读取: {docx_path}")
print("=" * 60)

try:
    doc = docx.Document(docx_path)

    # 提取所有段落
    commands = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text and ('adb' in text or text.startswith('#') or text.startswith('//')):
            commands.append(text)
            print(text)

    # 保存到文件
    with open('adb-commands-extracted.txt', 'w', encoding='utf-8') as f:
        for cmd in commands:
            f.write(cmd + '\n')

    print("\n" + "=" * 60)
    print(f"共提取了 {len(commands)} 条命令")
    print("已保存到: adb-commands-extracted.txt")

except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
