import argparse
import json
import os
from pathlib import Path


def collect_office_files(base_dir, output_json="office_files.json"):
    """
    Traverse the specified directory and collect relative paths of all Office files (PPT, PDF, WPS, etc.)

    Args:
        base_dir (str): Base directory to scan
        output_json (str): Output JSON filename
    """
    # Supported file extensions
    supported_extensions = {
        # '.pptx', '.ppt',  # PowerPoint
        ".pdf",  # PDF
        ".txt",  # Text files
        # '.wps', '.wpt',   # WPS Writer
        # '.et', '.ett',    # WPS Spreadsheet
        # '.dps', '.dpt',   # WPS Presentation
        # '.doc', '.docx',  # Word
        # '.xls', '.xlsx',  # Excel
    }

    office_files = []
    base_path = Path(base_dir)

    # Ensure base directory exists
    if not base_path.exists():
        print(f"Error: Directory '{base_dir}' does not exist")
        return

    print(f"Starting to scan directory: {base_dir}")

    # Traverse all files and subdirectories
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            # Get file extension
            file_ext = Path(file).suffix.lower()

            # Check if it's a target file type
            if file_ext in supported_extensions:
                # Build full file path
                full_path = Path(root) / file

                # Calculate relative path
                try:
                    relative_path = full_path.relative_to(base_path)
                    office_files.append(
                        {
                            "path": str(relative_path),
                            "filename": file,
                            "extension": file_ext,
                            "size": full_path.stat().st_size
                            if full_path.exists()
                            else 0,
                        }
                    )
                    print(f"Found file: {relative_path}")
                except ValueError as e:
                    print(f"Path calculation error: {e}")

    # Save to JSON file
    output_path = Path(base_dir) / output_json
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "base_directory": str(base_path),
                    "total_files": len(office_files),
                    "files": office_files,
                },
                f,
                ensure_ascii=False,
                indent=2,
            )

        print("\nScan completed!")
        print(f"Found {len(office_files)} files in total")
        print(f"Results saved to: {output_path}")

    except Exception as e:
        print(f"Error saving file: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Collect Office file paths in specified directory and save to JSON file"
    )
    parser.add_argument(
        "input_dir",
        nargs="?",
        default=".",
        help="Input directory path to scan (default: current directory)",
    )
    parser.add_argument(
        "-f",
        "--json_file",
        default="office_files.json",
        help="Output JSON file path (default: office_files.json)",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        help="Output file directory (if specified, output file will be saved to this directory)",
    )

    args = parser.parse_args()

    # Handle output file path
    if args.output_dir:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = (output_dir / args.json_file).absolute()
    else:
        output_file = args.json_file

    print(f"Input directory: {args.input_dir}")
    print(f"Output file: {output_file}")

    # Execute scan
    input_dir = Path(args.input_dir).resolve()
    collect_office_files(input_dir, str(output_file))


if __name__ == "__main__":
    main()
