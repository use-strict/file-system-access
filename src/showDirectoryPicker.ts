const native: typeof globalThis.showDirectoryPicker | undefined = globalThis.showDirectoryPicker

export interface CustomDirectoryPickerOptions extends DirectoryPickerOptions {
  /** If you rather want to use the polyfill instead of the native implementation */
  _preferPolyfill?: boolean
}

export async function showDirectoryPicker (options: CustomDirectoryPickerOptions = {}): Promise<globalThis.FileSystemDirectoryHandle> {
  if (native && !options._preferPolyfill) {
    return native(options)
  }

  const input = document.createElement('input')
  input.type = 'file'

  // @ts-ignore
  input.webkitdirectory = true
  // Fallback to multiple files input for iOS Safari
  input.multiple = true

  // See https://stackoverflow.com/questions/47664777/javascript-file-input-onchange-not-working-ios-safari-only
  input.style.position = 'fixed'
  input.style.top = '-100000px'
  input.style.left = '-100000px'
  document.body.appendChild(input)

  const { makeDirHandleFromFileList } = await import('./util.js')

  return new Promise<FileSystemDirectoryHandle>((resolve, reject) => {
    input.addEventListener('change', () => {
      makeDirHandleFromFileList(input.files!).then(resolve).catch(reject)
      document.body.removeChild(input)
    })
    input.click()
  })
}

export default showDirectoryPicker
