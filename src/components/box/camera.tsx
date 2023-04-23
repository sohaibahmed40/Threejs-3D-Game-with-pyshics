import React from 'react';
import { OrthographicCamera } from '@react-three/drei';
export const OrthoCamera=()=>{
    return  <OrthographicCamera makeDefault position={[0, 0, 0]} zoom={50} />
}