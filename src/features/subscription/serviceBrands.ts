/*
 * ============================================================================
 * [홈 구현 2/8] 서비스별 로고·대표색 표
 * ============================================================================
 * 서버(DB)에는 로고 그림과 대표색이 없다 (service_preset.logo_url 은 비어 있고, 대표색 컬럼은 없음).
 * 그래서 앱이 "서비스 이름 → 로고·대표색" 표를 들고 있는다. toSubscription.ts(3번)가 이 표를 쓴다.
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   (1) export type ServiceBrand = { logo: ServiceLogo; accent: { color: string; soft: string } };
 *       - ServiceLogo 는 ./types 에 이미 있다
 *
 *   (2) export const SERVICE_BRANDS: Record<string, ServiceBrand>
 *       - 키는 서비스 이름. 서버 V2__seed_categories_presets.sql 의 service_preset.service_name 과 똑같이 쓴다
 *         넷플릭스 / 디즈니+ / YouTube Premium / 스포티파이 / iCloud+ / 쿠팡 와우
 *       - 값은 Figma 시안의 logo, accent 를 쓴다
 *       - presetId(숫자)를 키로 쓰지 않는 이유: DB 마다 번호가 달라질 수 있어서. 이름은 시드에 고정돼 있다
 *
 *   (3) export function getServiceBrand(name: string): ServiceBrand
 *       - 표에 있으면 그 값
 *       - 없으면 (직접 입력한 구독) 기본값: 이름 첫 글자 텍스트 로고
 *           logo:   { kind: 'text', text: name.slice(0, 1), color: '#FFFFFF', fontSize: 16.56, background: '#A5AABB' }
 *           accent: { color: colors.primary, soft: colors.backgroundMuted } 처럼 theme 색에서 고른다
 *
 *         두 곳에 같은 값이 생기지만, 캘린더·통계도 API 로 바꿀 때 목업을 정리한다.
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   getServiceBrand('넷플릭스').logo.text === 'N'
 *   getServiceBrand('왓챠').logo.text === '왓'
 */

import ICloudLogo from '@/assets/images/service-logos/icloud.svg';
import ICloudLogoLarge from '@/assets/images/service-logos/icloud-lg.svg';
import SpotifyLogo from '@/assets/images/service-logos/spotify.svg';

import { Colors } from '@/constants/theme';
import type { ServiceLogo } from './types';

export type ServiceBrand = {
     logo: ServiceLogo;
     accent: {
         color: string;
         soft: string
        }
    };

export const SERVICE_BRANDS: Record<string, ServiceBrand> = {
    '넷플릭스': {
        logo: {
            kind: 'text',
            text: 'N',
            color: '#E50914',
            fontSize: 23.4,
            background: '#151515'
        },
        accent: {
            color: '#E50914',
            soft: '#FDEBEC'
        },
    },
    '디즈니+': {
        logo: {
            kind: 'text',
            text: 'D+',
            color: '#FFFFFF',
            fontSize: 16.56,
            background: '#132464'
        },
        accent: {
            color: '#1E3A8A',
            soft: '#E6EBF7'
        },
    },
    'YouTube Premium': {
        logo: {
            kind: 'text',
            text: '▶',
            color: '#FFFFFF',
            fontSize: 16.56,
            background: '#F04848'
        },
        accent: {
            color: '#F43F5E',
            soft: '#FEE7EC'
        },
    },
    '스포티파이': {
        logo: {
            kind: 'icon',
            Icon: SpotifyLogo,
            size: 22.32,
            background: '#172B20'
        },
        accent: {
            color: '#1ED760',
            soft: '#E3F9EC'
        },
    },
    'iCloud+': {
        logo: {
            kind: 'icon',
            Icon: ICloudLogo,
            size: 22.32,
            background: '#EDF5FF',
            large: { Icon: ICloudLogoLarge, size: 26.04 }
        },
        accent: {
            color: '#3B8EEA',
            soft: '#E8F2FD'
        },
    },
    '쿠팡 와우': {
        logo: {
            kind: 'text',
            text: 'C',
            color: '#FFFFFF',
            fontSize: 16.56,
            background: '#A5AABB'
        },
        accent: {
            color: '#F59E0B',
            soft: '#FEF3DC'
        },
    },
}

export function getServiceBrand(name: string): ServiceBrand {
    return SERVICE_BRANDS[name] ?? {
        logo: {
            kind: 'text',
            text: name.slice(0, 1),
            color: '#FFFFFF',
            fontSize: 16.56,
            background: '#A5AABB'
        },
        accent: {
            color: Colors.light.textSecondary,
            soft: Colors.light.backgroundElement
        },
    };
}
