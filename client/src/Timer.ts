// interface ITimer {
//   time: number;
//   function: Function;
//   timer: number | null;
// }

class Timer {
  private timer: number | null = null;

  constructor(private readonly func: Function, private time: number) {}

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return this;
  }

  start() {
    console.log('start');
    this.stop();
    this.timer = setTimeout(this.func, this.time);

    return this;
  }

  reset(newTime: number = this.time) {
    this.time = newTime;
    return this.start();
  }
}

export default Timer;
