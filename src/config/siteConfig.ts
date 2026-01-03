import type { SiteConfig } from "@/types/config";
import { fontConfig } from "./fontConfig";

// 定义站点语言
// 语言代码，例如：'zh_CN', 'zh_TW', 'en', 'ja', 'ru'。
const SITE_LANG = "zh_CN";

export const siteConfig: SiteConfig = {
	title: "陌灬离的博客",
	subtitle: "心之所向，素履以往",
	site_url: "https://firefly.cuteleaf.cn",

	// 站点描述
	description:
		"Firefly 是一款基于 Astro 框架和 Fuwari 模板开发的清新美观且现代化个人博客主题模板，专为技术爱好者和内容创作者设计。该主题融合了现代 Web 技术栈，提供了丰富的功能模块和高度可定制的界面，让您能够轻松打造出专业且美观的个人博客网站。",

	// 站点关键词
	keywords: [
		"Firefly",
		"Fuwari",
		"Astro",
		"ACGN",
		"博客",
		"技术博客",
		"静态博客",
	],

	// 主题色
	themeColor: {
		hue: 285, // 主题色的默认色相，范围从 0 到 360。例如：红色：0，青色：200，蓝绿色：250，粉色：345
		fixed: false, // 对访问者隐藏主题色选择器
		defaultMode: "system", // 默认模式："light" 亮色，"dark" 暗色，"system" 跟随系统
	},

	// Favicon 配置
	favicon: [
		{
			src: "/assets/images/myico.ico", // 图标文件路径
			// theme: "light", // 可选，指定主题 'light' | 'dark'
			// sizes: "32x32", // 可选，图标大小
			//注释之后发现能正常显示
		},
	],

	// 导航栏配置
	navbar: {
		// 导航栏Logo
		// 支持三种类型：Astro图标库，本地图片，网络图片
		// { type: "icon", value: "material-symbols:home-pin-outline" }
		// { type: "image", value: "/assets/images/logo.webp", alt: "Firefly Logo" }
		// { type: "image", value: "https://example.com/logo.png", alt: "Firefly Logo" }
		logo: {
			type: "image",
			value: "/assets/images/LiuYingPure3.svg",
			alt: "🍀",
		},
		// 导航栏标题
		title: "𝓜𝓞𝓵𝓲",
		// 全宽导航栏，导航栏是否占满屏幕宽度，true：占满，false：不占满
		widthFull: false,
		// 导航栏图标和标题是否跟随主题色
		followTheme: false,
	},

	// 站点开始日期，用于统计运行天数
	siteStartDate: "2026-01-01", // 请修改为你的站点实际开始日期，格式：YYYY-MM-DD

	// 文章页底部的"上次编辑时间"卡片开关
	showLastModified: true,

	// 文章过期阈值（天数），超过此天数才显示"上次编辑"卡片
	outdatedThreshold: 30,

	// OpenGraph图片功能,注意开启后要渲染很长时间，不建议本地调试的时候开启
	generateOgImages: false,

	// bangumi配置
	bangumi: {
		userId: "1194609", // 在此处设置你的Bangumi用户ID
	},

	// 页面开关配置 - 控制特定页面的访问权限，设为false会返回404
	// bangumi的数据为编译时获取的，所以不是实时数据，请配置bangumi.userId
	pages: {
		// 赞助页面开关
		sponsor: true,
		// 留言板页面开关，需要配置评论系统
		guestbook: true,
		// 番组计划页面开关，含追番、游戏、书籍和音乐，dev调试时只获取一页数据，build才会获取全部数据
		bangumi: true,
	},

	// 文章列表布局配置
	postListLayout: {
		// 默认布局模式："list" 列表模式（单列布局），"grid" 网格模式（双列布局）
		// 如果sidebarConfig.ts中侧边栏配置启用了"both"双侧边栏，则无法使用文章列表"grid"网格（双列）布局
		defaultMode: "list",
		// 是否允许用户切换布局
		allowSwitch: true,
		// 网格布局配置，仅在 defaultMode 为 "grid" 或允许切换布局时生效
		grid: {
			// 是否开启瀑布流布局，同时有封面图和无封面图的混合文章推荐开启
			masonry: true,
			// 网格模式下封面位置："top" 顶部，"right" 右侧
			coverPosition: "top",
		},
	},

	// 分页配置
	pagination: {
		// 每页显示的文章数量
		postsPerPage: 10,
	},

	// 统计分析
	analytics: {
		// Microsoft Clarity ID
		clarityId: "tx9equrgr6",
	},

	// 字体配置
	// 在src/config/fontConfig.ts中配置具体字体
	font: fontConfig,

	// 站点语言，在本配置文件顶部SITE_LANG定义
	lang: SITE_LANG,
};
