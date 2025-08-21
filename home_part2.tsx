    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    marginTop: -8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F5132',
    marginHorizontal: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  carouselContainer: {
    paddingLeft: 20,
  },
  carousel: { 
    paddingRight: 20,
    paddingVertical: 8,
  },
  
  // CARTES DE CATÉGORIES AGRANDIES
  categoryCard: {
    width: 160,
    height: 190,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F0E8',
    position: 'relative',
  },
  categoryCardPremium: {
    borderColor: '#0A7C3A',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#0A7C3A',
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A7C3A',
  },
  // ICÔNES AGRANDIES À 64PX
  categoryIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F5132',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryLabelPremium: {
    color: '#0A7C3A',
    fontWeight: '700',
  },
  // STYLE PREMIUM AMÉLIORÉ
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    backgroundColor: '#8B7000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  
  // Emblem Section
  emblemSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emblemImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  mottoText: {
    marginTop: 8,
    color: '#0F5132',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // AI FAB Styles
  aiFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0A7C3A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  aiHalo: {
    ...Platform.select({
      ios: { shadowColor: '#0A7C3A', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } },
      android: { elevation: 10 },
      default: { },
    }),
  },
  aiImg: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});