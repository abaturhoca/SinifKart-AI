import cvModule from '@techstark/opencv-js'
import { readMarkers } from './src/scan.js'
const cv = await Promise.resolve(cvModule)
const dictionary = cv.getPredefinedDictionary(cv.DICT_4X4_250)
let passed = 0
for (const id of Array.from({length: 100}, (_, i) => i)) {
  const marker = new cv.Mat()
  dictionary.generateImageMarker(id, 180, marker, 1)
  const scene = new cv.Mat(220, 220, cv.CV_8UC1, new cv.Scalar(255))
  marker.copyTo(scene.roi(new cv.Rect(20, 20, 180, 180)))
  for (let turn = 0; turn < 4; turn++) {
    const rotated = new cv.Mat()
    if (turn) cv.rotate(scene, rotated, [null, cv.ROTATE_90_CLOCKWISE, cv.ROTATE_180, cv.ROTATE_90_COUNTERCLOCKWISE][turn])
    else scene.copyTo(rotated)
    const result = readMarkers(cv, rotated)
    if (result.cards.length !== 1 || result.cards[0].cardId !== id + 1 || result.cards[0].answer !== 'ABCD'[turn]) {
      throw Error(JSON.stringify({ id, turn, result }))
    }
    passed++
    rotated.delete()
  }
  marker.delete(); scene.delete()
}
dictionary.delete()
console.log(`H6 synthetic image orientations: ${passed}/400`)
