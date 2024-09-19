import type { Vitest } from 'vitest/node';
import type { RunnerTestFile, RunnerTask, TaskResult } from 'vitest';
import type { Reporter } from 'vitest/reporters';
import fs from 'node:fs';
import path from 'node:path';

interface TestResults {
	numTotalTests: number;
	numPassedTests: number;
	numFailedTests: number;
	numPendingTests: number;
}

class CustomReporter implements Reporter {
	private ctx!: Vitest;
	private results: TestResults;

	constructor() {
		this.results = {
			numTotalTests: 0,
			numPassedTests: 0,
			numFailedTests: 0,
			numPendingTests: 0,
		};
	}

	onInit(ctx: Vitest): void {
		this.ctx = ctx;
	}

	onFinished(files?: RunnerTestFile[]): void {
		if (files) {
			for (const file of files) {
				this.processFile(file);
			}
		}

		this.writeResults();
	}

	private processFile(file: RunnerTestFile): void {
		const tasks = file.tasks;
		for (const task of tasks) {
			this.processTask(task);
		}
	}

	private processTask(task: RunnerTask): void {
		if (task.type === 'test') {
			this.results.numTotalTests++;
			if (task.result?.state === 'pass') {
				this.results.numPassedTests++;
			} else if (task.result?.state === 'fail') {
				this.results.numFailedTests++;
			} else if (task.mode === 'skip' || task.mode === 'todo') {
				this.results.numPendingTests++;
			}
		} else if (task.type === 'suite') {
			for (const childTask of task.tasks) {
				this.processTask(childTask);
			}
		}
	}

	private writeResults(): void {
		const outputPath = path.join(process.cwd(), 'test-results.json');
		fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
		console.log(`Test results written to ${outputPath}`);
	}
}

export default CustomReporter;
