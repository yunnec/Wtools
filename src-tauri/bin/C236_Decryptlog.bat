:: 解密日志

:: 输入一个参数，为日志文件路径

:: 检查参数是否正确
if "%~1"=="" (
    echo 请输入日志文件名
    pause
    exit /b 1
)

:: 解密程序为 DecryptLogForWinX64.exe
:: 解密日志路径为源文件路径同级目录
:: 解密后的日志文件名与源文件文件名相同，只是扩展名改为 .tar.gz

DecryptLogForWinX64.exe "%~1" "%~dpn1.tar.gz"

:: 检查解密是否成功
if not exist "%~dpn1.tar.gz" (
    echo 解密失败
    exit /b 1
)

echo 解密成功
exit /b 0


