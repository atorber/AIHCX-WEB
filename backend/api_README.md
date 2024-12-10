
## 启动服务

uvicorn api:app --host 0.0.0.0 --port 8000

## 请求示例

python api-test.py

## 编译成桌面程序

```
# 安装PyInstaller
pip install pyinstaller

# 编译api.py
pyinstaller --onefile --name api_program api.py

# 运行生成的可执行文件
./dist/api_program
```