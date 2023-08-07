import { Bodies, Body, Composite, Engine, Render, Runner, Composites, Constraint } from "matter-js";
import { Conf } from "../core/conf";
import { Func } from "../core/func";
import { MyObject3D } from "../webgl/myObject3D";
import { Point } from "../libs/point";
import { MousePointer } from "../core/mousePointer";

export class MatterjsMgr extends MyObject3D {

  public engine:Engine;
  public render:Render;

  private _runner:Runner;

  public lineBodies:Array<Array<Body>> = [];

  constructor() {
    super()

    const sw = Func.sw();
    const sh = Func.sh();

    // エンジン
    this.engine = Engine.create();
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;

    // レンダラー
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: sw,
        height: sh,
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false,
        pixelRatio:Conf.instance.FLG_SHOW_MATTERJS ? 1 : 0.1
      }
    });
    this.render.canvas.classList.add('l-matter');

    if(!Conf.instance.FLG_SHOW_MATTERJS) {
      this.render.canvas.classList.add('-hide');
    }

    const num = Conf.instance.ITEM_NUM;
    for(let i = 0; i < num; i++) {
      this.lineBodies[i] = []
      const it = sw / num
      this._makeLine(new Point((it * i) + it * 0.5, sh * 0), i);
    }

    // マウス
    // const mouse = Mouse.create(this.render.canvas);
    // const mouseConstraint = MouseConstraint.create(this.engine, {
    //   mouse: mouse,
    // })
    // Composite.add(this.engine.world, mouseConstraint)
    // this.render.mouse = mouse

    this._runner = Runner.create();

    this.start();
    this._resize();
  }


  private _makeLine(p: Point, key:number): void {
    const allSize = Func.sh() * 0.5;
    const stiffness = 0.01
    const friction = 0.01
    const bridgeNum = 6;
    const bridgeSize = (allSize / bridgeNum) * 0.5;

    const bridge = Composites.stack(0, 0, bridgeNum, 1, 0, 0, (x:number, y:number) => {
      return Bodies.rectangle(x, y, bridgeSize * 2, bridgeSize * 1, {
        collisionFilter: { group: Body.nextGroup(true) },
        // density: 0.05,
        friction: friction,
        render: {
          fillStyle: '#060a19',
          visible: Conf.instance.FLG_SHOW_MATTERJS
        }
      });
    });

    Composites.chain(bridge, 0, 0, 0, 0, {
      stiffness: stiffness,
      length: 1,
      render: {
        visible: Conf.instance.FLG_SHOW_MATTERJS
      }
    });

    Composite.add(this.engine.world, [
      bridge,
      Constraint.create({
          pointA: { x: p.x, y: p.y + Func.sh() * 0.1 },
          bodyB: bridge.bodies[0],
          pointB: { x: 0, y: 0 },
          length: 0,
          stiffness: stiffness
      }),
      Constraint.create({
          // pointA: { x: p.x, y: p.y + bridgeSize * bridgeNum + bridgeSize },
          pointA: { x: p.x, y: p.y + Func.sh() * 0.9 },
          bodyB: bridge.bodies[bridge.bodies.length - 1],
          pointB: { x: 0, y: 0 },
          length: 0,
          stiffness: stiffness
      })
    ]);

    // Bodyだけ入れておく
    bridge.bodies.forEach((b,i) => {
      Body.setPosition(b, {x: p.x, y: p.y + bridgeSize * i});
      this.lineBodies[key].push(b);
    })
  }


  public start(): void {
    Render.run(this.render);
    Runner.run(this._runner, this.engine);
  }


  public stop(): void {
    Render.stop(this.render);
    Runner.stop(this._runner);
  }




  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update();

    const sw = Func.sw();
    // const sh = Func.sh();
    const size = (sw / Conf.instance.ITEM_NUM) * 0.25

    const mx = MousePointer.instance.x
    const my = MousePointer.instance.y

    this.lineBodies.forEach((b) => {
      const len = ~~(b.length * 0.5)
      b[len].position.x = mx
      b[len].position.y = my + size * 0
    })
  }


  protected _resize(): void {
    super._resize();

    const sw = Func.sw()
    const sh = Func.sh()

    this.render.canvas.width = sw
    this.render.canvas.height = sh
  }
}