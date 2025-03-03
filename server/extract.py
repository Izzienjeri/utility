import os

OUTPUT_FILE = "data.txt"
EXCLUDE_FILE = "extract.py"  

def extract_python_files():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as output:
        for root, _, files in os.walk("."):  
            for file in files:
                if file.endswith(".py") and file != EXCLUDE_FILE:  
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, ".")  
                    
                    with open(file_path, "r", encoding="utf-8") as f:
                        code = f.read()
                    
                    
                    output.write("\n" + "="*40 + "\n")
                    output.write(f"{relative_path}\n")
                    output.write("="*40 + "\n\n")
                    output.write(code)
                    output.write("\n\n")  

if __name__ == "__main__":
    extract_python_files()
    print(f"✅ Python files extracted successfully to {OUTPUT_FILE}, excluding {EXCLUDE_FILE}")
