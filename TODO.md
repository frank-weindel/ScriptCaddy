* Make a solid boiler plate React+Redux+Electron base
  * ~Add electron version info~
  * eslint
    * Check google's and eslint recommended against my standards stance
  * Bundle building stuff
  * (later) Set up husky / PR linting checks
  * (later) typescript
* MVP
  * ~Side nav~
  * ~Script running engine~
  * ~Load/save scripts~
  * ~Script hook require~
    * ~stdout/stderr capture~
    * ~console output~
    * ~input values~
    * ~output values~
  * ~Tab bar~
  * ~Input / Output UI Tab~
  * GET ON PUBLIC GITHUB
    * ~Choose a license~
    * README
    * ~Code of conduct~
    * Contribution guidelines
    * Reset code
    * ~Come up with a name~yodate
    * ~compile for mac~
      * ~Look into Travis for remote build: https://www.electron.build/multi-platform-build~
    * ~Master to main~
    * ~Fix script home detection~
  * Create good example scripts
  * ~Pretty print main output~
  * Console output modes
    * Raw
    * Console logs
  * ~Create new script~
  * ~Need a way to force stop a script~
  * ~Tie inputs/outputs to individual script files~
  * ~Continuous console logs that auto scroll to the bottom~
  * ~Indicate script run time after completion~
  * ~save without running!~
  * ~save confirm modal before opening new script~
  * ~Install husky commit hooks~
  * Tie console to individual script files
  * ~Need way to do live output for long running scripts~
  * Long outputs don't seem to be updating in I/O
* Future
  * Import scripts
  * Find
  * Auto install NPM dependencies
  * Configurable inputs and outputs
    * Including types of each input and output
  * File inputs (and outputs)
* Stuff to do before releasing template / real app
  * Proper OSX build step
  * Setting copywrite/company name win32 attributes
  * Remove unnecessary NPM packages and ignore unnecessary folders to save space
