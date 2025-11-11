// Learn more about Tauri commands at https://tauri.app/develop/calling-rust-/
use std::process::Command;
use std::fs;
use std::path::{Path, PathBuf};
use tar::Archive;
use flate2::read::GzDecoder;

/**
 * 执行系统命令
 * @param command 要执行的命令
 * @return 执行结果
 */
#[tauri::command]
async fn execute_command(command: &str) -> Result<String, String> {
    // 分割命令和参数
    let mut parts = command.trim().split_whitespace();
    let cmd = parts.next().ok_or("命令不能为空")?;

    // 构建命令
    let mut process = Command::new(cmd);
    for arg in parts {
        process.arg(arg);
    }

    // 执行命令并获取输出
    match process.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);

            if output.status.success() {
                Ok(format!("执行成功:\n{}", stdout))
            } else {
                Err(format!("执行失败:\n{}", stderr))
            }
        }
        Err(e) => Err(format!("命令执行错误: {}", e))
    }
}

/**
 * 显示文件选择对话框
 * @param _filters 文件过滤器
 * @return 选择的文件路径
 */
#[tauri::command]
async fn open_file_dialog(_filters: Option<String>) -> Result<Option<String>, String> {
    println!("[236解压] 打开文件选择对话框...");

    // 使用Tauri的native dialog
    #[cfg(desktop)]
    {
        let dialog = rfd::AsyncFileDialog::new()
            .set_title("选择236日志文件")
            .add_filter("日志文件", &["gz", "tar.gz", "dat", "log", "enc"])
            .add_filter("所有文件", &["*"]);

        let file_handle = dialog.pick_file().await;
        match file_handle {
            Some(file) => {
                let path = file.path().to_str()
                    .ok_or("路径转换失败")?
                    .to_string();
                println!("[236解压] 用户选择文件: {}", path);
                Ok(Some(path))
            }
            None => {
                println!("[236解压] 用户取消选择");
                Ok(None)
            }
        }
    }

    #[cfg(not(desktop))]
    {
        Ok(None)
    }
}

/**
 * 尝试直接解压文件（不经过解密）
 * @param file_path 文件路径
 * @param extract_dir 解压目录
 * @return 是否解压成功
 */
fn try_direct_extract(file_path: &str, extract_dir: &Path) -> Result<bool, String> {
    println!("[236解压] 正在尝试直接解压: {}", file_path);

    // 创建解压目录
    if let Err(e) = fs::create_dir_all(extract_dir) {
        return Err(format!("创建解压目录失败: {}", e));
    }

    // 尝试作为tar.gz解压
    let file = match fs::File::open(file_path) {
        Ok(f) => f,
        Err(e) => {
            println!("[236解压] 无法打开文件: {}", e);
            return Ok(false);
        }
    };

    // GzDecoder::new()不返回Result，直接使用
    let gz = GzDecoder::new(file);
    let mut archive = Archive::new(gz);

    match archive.unpack(extract_dir) {
        Ok(_) => {
            println!("[236解压] 直接解压成功");
            // 检查是否真的解压了文件
            if extract_dir.read_dir().map(|_| true).unwrap_or(false) {
                Ok(true)
            } else {
                Ok(false)
            }
        }
        Err(e) => {
            println!("[236解压] 直接解压失败: {}", e);
            Ok(false)
        }
    }
}

/**
 * 236日志解压功能
 * @param encrypted_file_path 加密日志文件路径
 * @param output_dir 输出目录（可选，默认在文件同目录创建{文件名}_logs）
 * @return 解压结果信息
 */
#[tauri::command]
async fn decompress_236_log(
    encrypted_file_path: &str,
    output_dir: Option<&str>,
) -> Result<String, String> {
    println!("[236解压] === 开始执行解压命令 ===");
    println!("[236解压] 接收到的文件路径: {}", encrypted_file_path);
    println!("[236解压] 输出目录: {:?}", output_dir);

    let encrypted_path = Path::new(encrypted_file_path);

    // 检查源文件是否存在
    if !encrypted_path.exists() {
        let error_msg = format!("文件不存在: {}", encrypted_file_path);
        println!("[236解压] 错误: {}", error_msg);
        return Err(error_msg);
    }

    println!("[236解压] 文件存在检查通过");

    // 获取文件信息
    let file_name = encrypted_path
        .file_stem()
        .ok_or("无法获取文件名")?
        .to_str()
        .ok_or("文件名编码错误")?;
    
    let parent_dir = encrypted_path.parent()
        .ok_or("无法获取文件所在目录")?;
    
    // 确定输出目录
    let extract_dir = if let Some(dir) = output_dir {
        PathBuf::from(dir)
    } else {
        parent_dir.join(format!("{}_logs", file_name))
    };
    
    // 确定的解密后临时文件路径
    let decrypted_file = parent_dir.join(format!("{}_decrypted.tar.gz", file_name));

    println!("[236解压] 开始处理文件: {}", encrypted_file_path);
    println!("[236解压] 目标目录: {:?}", extract_dir);

    // 1. 尝试直接解压（不经过解密）
    println!("[236解压] 尝试直接解压文件...");
    let direct_extract_success = try_direct_extract(encrypted_file_path, &extract_dir).map_err(|e| {
        let error_msg = format!("直接解压失败: {}", e);
        println!("[236解压] {}", error_msg);
        error_msg
    })?;

    if direct_extract_success {
        println!("[236解压] 直接解压成功");
        return Ok(format!(
            "✅ 日志解压完成！\n\n📁 文件名: {}\n📂 解压目录: {}\n\n请查看日志文件。",
            file_name,
            extract_dir.display()
        ));
    }

    println!("[236解压] 直接解压失败，尝试解密后解压...");

    // 2. 查找解密工具
    println!("[236解压] 开始查找解密工具...");
    let decrypt_tool = find_decrypt_tool()
        .map_err(|e| {
            let error_msg = format!("查找解密工具失败: {}", e);
            println!("[236解压] 错误: {}", error_msg);
            error_msg
        })?;

    println!("[236解压] 找到解密工具: {}", decrypt_tool);

    // 3. 执行解密
    println!("[236解压] 开始解密文件...");
    let decrypt_result = Command::new(&decrypt_tool)
        .arg(encrypted_file_path)
        .arg(&decrypted_file)
        .output()
        .map_err(|e| format!("执行解密工具失败: {}", e))?;

    if !decrypt_result.status.success() {
        let stderr = String::from_utf8_lossy(&decrypt_result.stderr);
        return Err(format!("解密失败: {}", stderr));
    }

    if !decrypted_file.exists() {
        return Err("解密后的文件未找到".to_string());
    }

    println!("[236解压] 解密完成");

    // 3. 解压文件
    println!("[236解压] 开始解压文件...");
    fs::create_dir_all(&extract_dir)
        .map_err(|e| format!("创建解压目录失败: {}", e))?;
    
    let file = fs::File::open(&decrypted_file)
        .map_err(|e| format!("打开解密文件失败: {}", e))?;
    
    let gz = GzDecoder::new(file);
    let mut archive = Archive::new(gz);
    
    archive.unpack(&extract_dir)
        .map_err(|e| format!("解压文件失败: {}", e))?;
    
    println!("[236解压] 解压完成");

    // 4. 清理临时文件
    println!("[236解压] 清理临时文件...");
    fs::remove_file(&decrypted_file)
        .map_err(|e| format!("删除临时文件失败: {}", e))?;
    
    println!("[236解压] 处理完成");

    // 返回成功信息
    Ok(format!(
        "✅ 日志解压完成！\n\n📁 文件名: {}\n📂 解压目录: {}\n\n请查看日志文件。",
        file_name,
        extract_dir.display()
    ))
}

/**
 * 查找解密工具
 */
fn find_decrypt_tool() -> Result<String, String> {
    // 获取可执行文件所在目录
    let exe_dir = std::env::current_exe()
        .map_err(|e| format!("获取当前exe路径失败: {}", e))?
        .parent()
        .ok_or("无法获取exe目录")?
        .to_path_buf();
    
    // 查找路径列表（按优先级排序）
    let possible_paths = vec![
        exe_dir.join("bin").join("DecryptLogForWinX64.exe"),
        exe_dir.join("DecryptLogForWinX64.exe"),
    ];
    
    for path in possible_paths {
        if path.exists() {
            return Ok(path.to_str()
                .ok_or("路径转换失败")?
                .to_string());
        }
    }
    
    Err("未找到 DecryptLogForWinX64.exe\n\n请将解密工具放在以下位置之一：\n  - 与应用程序同目录的 bin 子目录\n  - 应用程序所在目录\n\n或联系管理员获取此文件。".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            execute_command,
            open_file_dialog,
            decompress_236_log
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
