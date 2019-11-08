const {spawn} = require('child_process');
const defOpts = {stdin: true, stdout: true};

module.exports = class Proc {
    constructor(path, args=[], {stdin, stdout, stderr}=defOpts) {
        this.promise = new Promise((res, rej) => {
            this.proc = spawn(path, args);

            if (stdin) {
                this.stdin = this.proc.stdin;
            }
            if (stdout) {
                this.stdout = [];
                this.stdoutLen = 0;

                this.proc.stdout.on('data', (chunk) => {
                    this.stdout.push(chunk);
                    this.stdoutLen += chunk.length;
                });
            }
            if (stderr) {
                this.stderr = [];
                this.stderrLen = 0;

                this.proc.stderr.on('data', (chunk) => {
                    this.stderr.push(chunk);
                    this.stderrLen += chunk.length;
                });
            }
            this.proc.on('close', res);
        });
    }

    getStdout() {
        return this.stdout && Buffer.concat(this.stdout, this.stdoutLen);
    }

    getStderr() {
        return this.stderr && Buffer.concat(this.stderr, this.stderrLen);
    }
}
