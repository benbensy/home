import { Application } from '@pixi/app';
import { Live2DModel } from 'pixi-live2d-display-lipsyncpatch';

export async function init(el: HTMLCanvasElement, options: {
    modelSrc: string;
}) {
    const app = new Application({
        view: el,
    });

    const model = await Live2DModel.from(options.modelSrc);

    app.stage.addChild(model);

    // transforms
    model.x = 100;
    model.y = 100;
    model.rotation = Math.PI;
    model.skew.x = Math.PI;
    model.scale.set(2, 2);
    model.anchor.set(0.5, 0.5);

    // interaction
    model.on('hit', (hitAreas) => {
        if (hitAreas.includes('body')) {
            model.motion('tap_body');
        }
    });

}