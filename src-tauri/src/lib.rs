// Learn more about Tauri commands at https://tauri.app/develop/calling-rust-/
use std::process::Command;
use std::path::Path;

/**
 * 自动打开文件夹
 * @param folder_path 文件夹路径
 * @return 操作结果
 */
fn open_folder(folder_path: &Path) -> Result<(), String> {
    let path_str = folder_path.to_str()
        .ok_or("路径转换失败")?;

    #[cfg(target_os = "windows")]
    {
        // Windows: 使用 explorer 命令
        Command::new("explorer")
            .arg(path_str)
            .spawn()
            .map_err(|e| format!("打开Windows文件夹失败: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        // macOS: 使用 open 命令
        Command::new("open")
            .arg(path_str)
            .spawn()
            .map_err(|e| format!("打开Mac文件夹失败: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Linux: 使用 xdg-open 命令
        Command::new("xdg-open")
            .arg(path_str)
            .spawn()
            .map_err(|e| format!("打开Linux文件夹失败: {}", e))?;
    }

    Ok(())
}

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
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            execute_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
