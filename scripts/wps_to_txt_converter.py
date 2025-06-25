import argparse
import os
from pathlib import Path
import sys
import subprocess
import tempfile

try:
    # Try importing python-docx for .wps file reading
    # Note: .wps files might need special handling or conversion tools
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    # Alternative: use win32com for Windows environments
    import win32com.client
    WIN32_AVAILABLE = True
except ImportError:
    WIN32_AVAILABLE = False


def convert_wps_to_txt_via_win32(wps_file_path, txt_file_path):
    """
    Convert WPS file to TXT using win32com (Windows only)
    """
    try:
        # Create Word application object
        word_app = win32com.client.Dispatch("Word.Application")
        word_app.Visible = False
        
        # Open WPS file
        doc = word_app.Documents.Open(str(wps_file_path))
        
        # Extract text content
        text_content = doc.Content.Text
        
        # Save as TXT file
        with open(txt_file_path, 'w', encoding='utf-8') as f:
            f.write(text_content)
        
        # Close document and application
        doc.Close()
        word_app.Quit()
        
        return True
    except Exception as e:
        print(f"Error converting {wps_file_path} via win32com: {e}")
        return False


def convert_wps_to_txt_simple(wps_file_path, txt_file_path):
    """
    Convert WPS file to TXT using LibreOffice unoconv
    """
    try:
        # Check if unoconv is available
        result = subprocess.run(['unoconv', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode != 0:
            print("unoconv not found. Please install LibreOffice and unoconv.")
            return False
        
        # Convert WPS to TXT using unoconv
        cmd = [
            'unoconv',
            '-f', 'txt',  # Output format
            '-o', str(txt_file_path),  # Output file
            str(wps_file_path)  # Input file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            # Check if output file was created and has content
            if Path(txt_file_path).exists() and Path(txt_file_path).stat().st_size > 0:
                return True
            else:
                print(f"unoconv completed but no valid output for {wps_file_path}")
                return False
        else:
            print(f"unoconv error for {wps_file_path}: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"Timeout converting {wps_file_path} with unoconv")
        return False
    except FileNotFoundError:
        print("unoconv not found. Please install LibreOffice and unoconv:")
        print("Ubuntu/Debian: sudo apt-get install libreoffice unoconv")
        print("CentOS/RHEL: sudo yum install libreoffice unoconv")
        print("macOS: brew install libreoffice && pip install unoconv")
        return False
    except Exception as e:
        print(f"Error converting {wps_file_path} via unoconv: {e}")
        return False


def convert_wps_file(wps_file_path, output_dir=None):
    """
    Convert a single WPS file to TXT format
    
    Args:
        wps_file_path (Path): Path to the WPS file
        output_dir (Path, optional): Output directory. If None, save in same directory as source
    """
    wps_path = Path(wps_file_path)
    
    # Determine output path
    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        txt_path = output_dir / f"{wps_path.stem}.txt"
    else:
        txt_path = wps_path.parent / f"{wps_path.stem}.txt"
    
    print(f"Converting: {wps_path} -> {txt_path}")
    
    # Try different conversion methods
    success = False
    
    # Method 1: Use win32com (Windows only)
    if WIN32_AVAILABLE and not success:
        success = convert_wps_to_txt_via_win32(wps_path, txt_path)
    
    # Method 2: Simple text extraction (fallback)
    if not success:
        success = convert_wps_to_txt_simple(wps_path, txt_path)
    
    if success:
        print(f"Successfully converted: {wps_path.name}")
        return True
    else:
        print(f"Failed to convert: {wps_path.name}")
        return False


def traverse_and_convert(base_dir, output_dir=None):
    """
    Traverse directory and convert all .wps files to .txt
    
    Args:
        base_dir (str): Base directory to scan
        output_dir (str, optional): Output directory for converted files
    """
    base_path = Path(base_dir)
    
    if not base_path.exists():
        print(f"Error: Directory '{base_dir}' does not exist")
        return
    
    print(f"Starting to scan directory: {base_dir}")
    
    converted_count = 0
    failed_count = 0
    
    # Find all .wps files
    for wps_file in base_path.rglob("*.wps"):
        if convert_wps_file(wps_file, output_dir):
            converted_count += 1
        else:
            failed_count += 1
    
    print(f"\nConversion completed!")
    print(f"Successfully converted: {converted_count} files")
    print(f"Failed conversions: {failed_count} files")


def main():
    parser = argparse.ArgumentParser(
        description="Convert WPS files to TXT format"
    )
    parser.add_argument(
        "input_dir",
        nargs="?",
        default=".",
        help="Input directory path to scan (default: current directory)",
    )
    parser.add_argument(
        "-o",
        "--output-dir",
        help="Output directory for converted TXT files (default: same as source files)",
    )
    parser.add_argument(
        "-f",
        "--file",
        help="Convert a single WPS file instead of traversing directory",
    )
    
    args = parser.parse_args()
    
    # Check if required libraries are available
    if not WIN32_AVAILABLE:
        print("Warning: win32com not available. Using fallback text extraction method.")
        print("For better results on Windows, install: pip install pywin32")
    
    # Convert single file or traverse directory
    if args.file:
        file_path = Path(args.file)
        if file_path.exists() and file_path.suffix.lower() == '.wps':
            convert_wps_file(file_path, args.output_dir)
        else:
            print(f"Error: File '{args.file}' does not exist or is not a .wps file")
    else:
        traverse_and_convert(args.input_dir, args.output_dir)


if __name__ == "__main__":
    main()
