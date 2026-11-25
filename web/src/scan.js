// H6: local OpenCV WebAssembly still-image reader. The source image is never uploaded.
export function readMarkers(cv, frame) {
  const dictionary = cv.getPredefinedDictionary(cv.DICT_4X4_250)
  const parameters = new cv.aruco_DetectorParameters()
  const refinement = new cv.aruco_RefineParameters(10, 3, true)
  const detector = new cv.aruco_ArucoDetector(dictionary, parameters, refinement)
  const corners = new cv.MatVector()
  const ids = new cv.Mat()
  const start = performance.now()
  try {
    detector.detectMarkers(frame, corners, ids)
    const seen = Array.from(ids.data32S)
    const cards = seen.map((id, index) => {
      const polygon = corners.get(index)
      try {
        const p = Array.from(polygon.data32F)
        const angle = (Math.atan2(p[3] - p[1], p[2] - p[0]) * 180 / Math.PI + 360) % 360
        const quarter = Math.round(angle / 90)
        const deviation = Math.abs(angle - quarter * 90)
        const status = id < 0 || id >= 100 ? 'unknown'
          : seen.filter(value => value === id).length > 1 ? 'duplicate'
            : deviation >= 35 ? 'ambiguous' : 'ok'
        return { cardId: id + 1, answer: status === 'ok' ? 'ABCD'[quarter % 4] : null,
          status, rotation: Number(angle.toFixed(2)), corners: [0, 2, 4, 6].map(i => [p[i], p[i + 1]]) }
      } finally { polygon.delete() }
    })
    return { cards, elapsedMs: Number((performance.now() - start).toFixed(2)) }
  } finally {
    ids.delete(); corners.delete(); detector.delete(); refinement.delete(); parameters.delete(); dictionary.delete()
  }
}

export async function readPhoto(file) {
  const module = await import('@techstark/opencv-js')
  const cv = await Promise.resolve(module.default ?? module)
  const image = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const canvas = document.createElement('canvas')
  canvas.width = image.width; canvas.height = image.height
  canvas.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0)
  image.close()
  const frame = cv.imread(canvas)
  try { return readMarkers(cv, frame) } finally { frame.delete() }
}
