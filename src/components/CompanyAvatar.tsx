import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  TextStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';

interface CompanyAvatarProps {
  logoUrl: string | null;
  companyName: string;
  size?: number;
  borderRadius?: number;
  style?: ViewStyle;
  fallbackTextStyle?: TextStyle;
}

const CompanyAvatar: React.FC<CompanyAvatarProps> = ({
  logoUrl,
  companyName,
  size = 50,
  borderRadius,
  style,
  fallbackTextStyle,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  const getLogoUrl = () => {
    if (!logoUrl) return null;

    try {
      const cleanUrl = logoUrl.replace(/\s+/g, '');
      return cleanUrl;
    } catch (error) {
      console.error('Error processing URL:', error);
      return logoUrl;
    }
  };

  const processedLogoUrl = getLogoUrl();
  const avatarBorderRadius =
    borderRadius !== undefined ? borderRadius : size / 2;

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: avatarBorderRadius,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    ...style,
  };

  const imageStyle = {
    width: '100%' as const,
    height: '100%' as const,
  };

  const fallbackStyle: ViewStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const fallbackTextDefaultStyle: TextStyle = {
    color: '#ffffff',
    fontSize: size * 0.4, // Scale font size based on avatar size
    fontWeight: '600',
    ...fallbackTextStyle,
  };

  return (
    <View style={containerStyle}>
      {!imageError && !useFallbackImage && processedLogoUrl ? (
        <Image
          source={{ uri: processedLogoUrl }}
          style={imageStyle}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={error => {
            console.error('Image load error:', error);
            setImageError(true);
            setImageLoading(false);
            setTimeout(() => {
              setUseFallbackImage(true);
              setImageError(false);
            }, 100);
          }}
        />
      ) : useFallbackImage && !imageError && processedLogoUrl ? (
        <FastImage
          source={{
            uri: processedLogoUrl,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          style={imageStyle}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      ) : (
        <View style={fallbackStyle}>
          <Text style={fallbackTextDefaultStyle}>
            {companyName ? companyName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CompanyAvatar;
