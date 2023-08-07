import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { TexLoader } from '../webgl/texLoader';
import { Param } from '../core/param';
import { Conf } from '../core/conf';
import { SpringItem } from './springItem';
import { Color } from 'three';
import { Util } from '../libs/util';

export class Visual extends Canvas {

  private _con: Object3D
  private _item: Array<SpringItem> = []

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    for(let i = 0; i < Conf.instance.ITEM_NUM; i++) {
      const t = TexLoader.instance.get(Conf.instance.PATH_IMG + 't.png');
      // const item = new SpringItem(i, t, new Color([0xff0000, 0x00ff00, 0x0000ff][i % 3]))
      const item = new SpringItem(i, t, new Color(Util.random(0, 1), Util.random(0, 1), Util.random(0, 1)))
      this._con.add(item)
      this._item.push(item)
    }

    console.log(Param.instance.fps)

    this._resize();
  }


  protected _update(): void {
    super._update();

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.render(this.mainScene, this.cameraOrth);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(): void {
    super._resize();

    const w = Func.sw();
    const h = Func.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);

    this.cameraPers.fov = 80;
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();
  }
}
