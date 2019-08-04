import path from 'path';
import merge from 'webpack-merge';
import { tsOverlay } from './overlays/tsOverlay';
import { fileOverlay } from './overlays/fileOverlay';
import { displayBailoutOverlay } from './overlays/displayBailoutOverlay';
import { stylesOverlay } from './overlays/stylesOverlay';

export const basicWebpackConfig: any = {
  entry: './src/index',
  mode: 'production',
  output: {
    path: path.join(process.cwd(), 'dist'),
    filename: 'bundle.js'
  }
};

export const webpackConfig: any = merge(basicWebpackConfig, stylesOverlay(), tsOverlay(), fileOverlay(), displayBailoutOverlay());
