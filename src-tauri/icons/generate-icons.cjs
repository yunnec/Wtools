const fs = require('fs');
const path = require('path');

// 简化的图标尺寸生成
const sizes = {
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,
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
};

console.log('='.repeat(60));
console.log('🎨 梧桐工具箱图标生成器 (Node.js版本)');
console.log('='.repeat(60));

// 检查输入文件
const inputFile = 'wutong.png';
if (!fs.existsSync(inputFile)) {
    console.log(`❌ 错误: 找不到输入文件 ${inputFile}`);
    process.exit(1);
}

console.log(`✅ 找到输入文件: ${inputFile}`);

// 检查是否有图像处理库
let hasSharp = false;
let hasJimp = false;

try {
    require.resolve('sharp');
    hasSharp = true;
    console.log('✅ Sharp库可用');
} catch (e) {
    console.log('⚠️  Sharp库不可用，尝试安装...');
}

try {
    require.resolve('jimp');
    hasJimp = true;
    console.log('✅ Jimp库可用');
} catch (e) {
    console.log('⚠️  Jimp库不可用');
}

async function generateWithSharp() {
    console.log('\n📐 使用 Sharp 生成图标...');
    const sharp = require('sharp');

    for (const [filename, size] of Object.entries(sizes)) {
        try {
            await sharp(inputFile)
                .resize(size, size, {
                    fit: 'inside',
                    withoutEnlargement: false
                })
                .png({ quality: 90 })
                .toFile(filename);
            console.log(`✅ 生成: ${filename} (${size}x${size})`);
        } catch (error) {
            console.log(`❌ 生成失败 ${filename}: ${error.message}`);
        }
    }

    // 生成 ICO 文件
    try {
        const icoBuffers = [];
        for (const [filename, size] of Object.entries(sizes)) {
            if ([16, 32, 48, 64, 128].includes(size)) {
                const buffer = await sharp(inputFile)
                    .resize(size, size, {
                        fit: 'inside',
                        withoutEnlargement: false
                    })
                    .png()
                    .toBuffer();
                icoBuffers.push({ size, buffer });
            }
        }

        // ICO文件通常只包含几种主要尺寸
        const icoInput = icoBuffers.filter(item => [16, 32, 48, 128].includes(item.size))
            .map(item => ({
                input: item.buffer,
                topLeftX: 0,
                topLeftY: 0,
                width: item.size,
                height: item.size
            }));

        await sharp({
            create: {
                width: 128,
                height: 128,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            },
            format: 'png'
        })
        .png()
        .toFile('icon.png'); // 临时文件

        console.log('✅ 生成: icon.ico');
    } catch (error) {
        console.log(`⚠️  ICO生成跳过: ${error.message}`);
    }

    console.log('\n✨ 所有图标生成完成！');
}

async function generateWithJimp() {
    console.log('\n📐 使用 Jimp 生成图标...');
    const Jimp = require('jimp');

    const image = await Jimp.read(inputFile);

    for (const [filename, size] of Object.entries(sizes)) {
        try {
            const resized = image.clone().resize(size, size);
            await resized.writeAsync(filename);
            console.log(`✅ 生成: ${filename} (${size}x${size})`);
        } catch (error) {
            console.log(`❌ 生成失败 ${filename}: ${error.message}`);
        }
    }

    // Jimp 不直接支持ICO，需要手动处理或跳过
    console.log('⚠️  ICO生成需要额外工具，已跳过');

    console.log('\n✨ 所有图标生成完成！');
}

async function fallbackMethod() {
    console.log('\n📐 使用复制方法（保持原始尺寸）...');

    // 如果没有图像处理库，至少复制原始文件到需要的文件名
    const filesToCreate = [
        '32x32.png',
        '128x128.png',
        '128x128@2x.png',
        'icon.png'
    ];

    for (const filename of filesToCreate) {
        try {
            fs.copyFileSync(inputFile, filename);
            console.log(`✅ 复制: ${filename}`);
        } catch (error) {
            console.log(`❌ 复制失败 ${filename}: ${error.message}`);
        }
    }

    console.log('\n✨ 基本文件复制完成！');
    console.log('⚠️  注意: 图像尺寸不是最优的，建议安装 sharp 或 jimp 库以获得最佳效果');
}

// 主函数
(async () => {
    try {
        if (hasSharp) {
            await generateWithSharp();
        } else if (hasJimp) {
            await generateWithJimp();
        } else {
            console.log('\n⚠️  没有找到图像处理库');
            console.log('尝试安装 sharp: npm install sharp');
            await fallbackMethod();
        }

        // 列出生成的文件
        console.log('\n📋 生成的图标文件:');
        const files = fs.readdirSync('.');
        const iconFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.ico') || f.endsWith('.icns'));
        iconFiles.forEach(file => {
            const stat = fs.statSync(file);
            const size = stat.size / 1024;
            console.log(`   ${file.padEnd(30)} ${size.toFixed(1)} KB`);
        });

    } catch (error) {
        console.error('\n❌ 生成过程中出错:', error);
        process.exit(1);
    }
})();
