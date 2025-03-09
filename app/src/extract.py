import os

def extract_tsx_code(output_file="data.txt"):
    separator = "\n" + "=" * 80 + "\n"
    with open(output_file, "w", encoding="utf-8") as outfile:
        for root, _, files in os.walk("."):
            for file in files:
                if file.endswith(".tsx"):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as tsx_file:
                            content = tsx_file.read()
                            outfile.write(f"File: {file_path}{separator}{content}{separator}")
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    extract_tsx_code()