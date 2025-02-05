import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events'
import parser from 'xml2json'

interface ScanOptions {
  target: string | string[];
  ports?: string;
  timing?: 0 | 1 | 2 | 3 | 4 | 5;
  sudo?: boolean;
  serviceDetection?: boolean;
  osDetection?: boolean;
  script?: string;
}

interface PortInfo {
  port: number;
  protocol: string;
  state: string;
  service?: string;
  version?: string;
}

interface HostResult {
  ip: string;
  hostname?: string;
  os?: string;
  ports: PortInfo[];
  status: string;
}

class NmapScanner extends EventEmitter {
  private process: ChildProcess | null = null;
  private xmlOutput: string = '';
  private isScanning: boolean = false;

  constructor() {
    super();
  }

  private buildArguments(options: ScanOptions): string[] {
    const args: string[] = [];
  
    args.push('-T4', '--min-parallelism', '100', '--max-retries', '2', '--max-rtt-timeout', '500ms', '--min-rate', '5000');

    args.push('-sS', '-sU');

    args.push('--top-ports', '1000');
  
    if (options.osDetection) {
      args.push('-O');
    }
  
    if (options.serviceDetection) {
      args.push('-sV');
    }
  
    if (options.ports) {
      args.push('-p', options.ports);
    }
  
    if (options.script) {
      args.push(`--script=${options.script}`);
    }
  
    args.push('-oX', '-');
  
    const targets = Array.isArray(options.target) 
      ? options.target.join(' ') 
      : options.target;
    args.push(targets);
  
    return args;
  }

  public async scan(options: ScanOptions): Promise<HostResult[]> {
    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    this.isScanning = true;
    this.xmlOutput = '';

    return new Promise((resolve, reject) => {
      const args = this.buildArguments(options);
      const command = options.sudo ? 'sudo' : 'nmap';
      const finalArgs = options.sudo ? ['nmap', ...args] : args;

      this.process = spawn(command, finalArgs);

      this.process.stdout?.on('data', (data: Buffer) => {
        this.xmlOutput += data.toString();
        this.emit('data', parser.toJson(this.xmlOutput));
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        this.emit('error', data.toString());
      });

      this.process.on('close', (code) => {
        this.isScanning = false;
        if (code === 0) {
          try {
            const results = parser.toJson(this.xmlOutput);
            this.emit('complete', results);
            resolve(results as any);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Scan failed with code ${code}`));
        }
      });

      this.process.on('error', (error) => {
        this.isScanning = false;
        reject(error);
      });
    });
  }

  public stop(): void {
    if (this.process && this.isScanning) {
      this.process.kill();
      this.isScanning = false;
      this.emit('stopped');
    }
  }

  public getStatus(): boolean {
    return this.isScanning;
  }
}

export default NmapScanner;